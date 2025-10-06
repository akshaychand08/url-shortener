const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const Link = require('../models/Link');
const Click = require('../models/Click');
const AdSnippet = require('../models/AdSnippet');
const jwt = require('jsonwebtoken');

// Helper to get user ID from token (for anonymous shortening)
const getUserIdFromToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.id;
        } catch (error) {
            return null;
        }
    }
    return null;
};


exports.createLink = async (req, res) => {
    const { originalUrl, alias, expiresAt, password } = req.body;

    // 1. Validate URL
    if (!originalUrl || !validator.isURL(originalUrl, { require_protocol: true, protocols: ['http', 'https'] })) {
        return res.status(400).json({ error: 'A valid URL starting with http:// or https:// is required.' });
    }
     // Forbid localhost and internal IPs
    const forbiddenPatterns = [/^https?:\/\/localhost/, /^https?:\/\/127\.0\.0\.1/, /^https?:\/\/192\.168\./, /^https?:\/\/10\./];
    if (forbiddenPatterns.some(pattern => pattern.test(originalUrl))) {
        return res.status(400).json({ error: 'Internal or local URLs are not allowed.' });
    }

    const ownerId = getUserIdFromToken(req);

    try {
        let shortId;
        // 2. Handle Alias
        if (alias) {
            if (!/^[a-zA-Z0-9\-_]{3,64}$/.test(alias)) {
                return res.status(400).json({ error: 'Alias can only contain letters, numbers, hyphens, and underscores, and be 3-64 characters long.' });
            }
            const existingAlias = await Link.findOne({ alias });
            if (existingAlias) {
                return res.status(409).json({ error: 'Alias is already in use.' });
            }
            shortId = alias;
        } else {
            // Generate a unique shortId
            do {
                shortId = nanoid(7);
            } while (await Link.findOne({ shortId }));
        }

        // 3. Prepare Link Data
        const newLinkData = {
            originalUrl,
            shortId,
            alias: alias || null,
            owner: ownerId,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        };

        // 4. Handle Password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            newLinkData.passwordHash = await bcrypt.hash(password, salt);
        }

        const link = await Link.create(newLinkData);

        res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/${link.shortId}`,
            originalUrl: link.originalUrl,
            shortId: link.shortId,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error while creating the link.' });
    }
};

exports.registerClick = async (req, res) => {
    const { linkId } = req.body;
    if (!linkId) return res.status(400).json({error: 'Link ID is required.'});

    try {
        const link = await Link.findById(linkId);
        if (!link) return res.status(404).send();

        // Use 'x-forwarded-for' header from Vercel, fallback to remoteAddress
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geo = geoip.lookup(ip);
        const agent = useragent.parse(req.headers['user-agent']);
        
        const clickData = {
            linkId: link._id,
            ip: ip.split(',')[0].trim(), // Store first IP, and consider hashing/masking for privacy
            userAgent: req.headers['user-agent'],
            country: geo ? geo.country : 'Unknown',
            referer: req.headers.referer || 'Direct',
            device: agent.device.family,
            browser: agent.family,
        };

        await Click.create(clickData);
        
        // Atomically increment click count
        await Link.updateOne({ _id: link._id }, { $inc: { clickCount: 1 } });

        res.status(201).send();
    } catch (error) {
        console.error('Click registration error:', error);
        res.status(500).send();
    }
};


// Other link controller functions (getLinks, getLinkStats, updateLink, deleteLink)
// would be here, protected by the `auth` middleware.
// For brevity, their implementation is omitted but would involve standard Mongoose queries.
// Example:
exports.getLinks = async (req, res) => {
    try {
        const links = await Link.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getLinkStats = async (req, res) => {
     try {
        const { shortId } = req.params;
        const link = await Link.findOne({ shortId: shortId, owner: req.user._id });

        if (!link) {
            return res.status(404).json({ error: 'Link not found or you do not own it.' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const clicks = await Click.find({ linkId: link._id, timestamp: { $gte: thirtyDaysAgo } });

        // Aggregate data
        const dailyClicks = {};
        const countryCounts = {};
        const referrerCounts = {};
        const deviceCounts = {};
        const browserCounts = {};

        clicks.forEach(click => {
            // Daily
            const day = click.timestamp.toISOString().split('T')[0];
            dailyClicks[day] = (dailyClicks[day] || 0) + 1;

            // Country
            const country = click.country || 'Unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;

            // Referrer
            const referrer = click.referer ? new URL(click.referer).hostname : 'Direct';
            referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;

            // Device
            const device = click.device || 'Unknown';
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;

            // Browser
            const browser = click.browser || 'Unknown';
            browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        });

        res.json({
            totalClicks: link.clickCount,
            dailyClicks,
            countryCounts,
            referrerCounts,
            deviceCounts,
            browserCounts,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching stats.' });
    }
};
// ... PUT and DELETE handlers would follow a similar pattern
