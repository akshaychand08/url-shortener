// File: api/controllers/linkController.js

const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const Link = require('../models/Link');
const Click = require('../models/Click');
const jwt = require('jsonwebtoken');

// Helper to get user ID from token
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

// --- CREATE LINK ---
exports.createLink = async (req, res) => {
    const { originalUrl, alias, expiresAt, password } = req.body;

    if (!originalUrl || !validator.isURL(originalUrl, { require_protocol: true, protocols: ['http', 'https'] })) {
        return res.status(400).json({ error: 'A valid URL is required.' });
    }
    const forbiddenPatterns = [/^https?:\/\/localhost/, /^https?:\/\/127\.0\.0\.1/];
    if (forbiddenPatterns.some(pattern => pattern.test(originalUrl))) {
        return res.status(400).json({ error: 'Internal or local URLs are not allowed.' });
    }

    const ownerId = getUserIdFromToken(req);

    try {
        let shortId;
        if (alias) {
            if (!/^[a-zA-Z0-9\-_]{3,64}$/.test(alias)) {
                return res.status(400).json({ error: 'Invalid alias format.' });
            }
            const existingAlias = await Link.findOne({ alias });
            if (existingAlias) {
                return res.status(409).json({ error: 'Alias is already in use.' });
            }
            shortId = alias;
        } else {
            do {
                shortId = nanoid(7);
            } while (await Link.findOne({ shortId }));
        }

        const newLinkData = { originalUrl, shortId, alias: alias || null, owner: ownerId, expiresAt: expiresAt ? new Date(expiresAt) : null };
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


// --- REGISTER CLICK ---
exports.registerClick = async (req, res) => {
    const { linkId } = req.body;
    if (!linkId) return res.status(400).json({error: 'Link ID is required.'});

    try {
        const link = await Link.findById(linkId);
        if (!link) return res.status(404).send();

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geo = geoip.lookup(ip);
        const agent = useragent.parse(req.headers['user-agent']);
        
        const clickData = { linkId: link._id, ip: ip.split(',')[0].trim(), userAgent: req.headers['user-agent'], country: geo ? geo.country : 'Unknown', referer: req.headers.referer || 'Direct', device: agent.device.family, browser: agent.family };
        await Click.create(clickData);
        await Link.updateOne({ _id: link._id }, { $inc: { clickCount: 1 } });
        res.status(201).send();
    } catch (error) {
        console.error('Click registration error:', error);
        res.status(500).send();
    }
};

// --- GET USER'S LINKS ---
exports.getLinks = async (req, res) => {
    try {
        const links = await Link.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


// --- GET LINK STATS ---
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

        const dailyClicks = {}, countryCounts = {}, referrerCounts = {}, deviceCounts = {}, browserCounts = {};
        clicks.forEach(click => {
            const day = click.timestamp.toISOString().split('T')[0];
            dailyClicks[day] = (dailyClicks[day] || 0) + 1;
            const country = click.country || 'Unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
            const referrer = click.referer && !click.referer.startsWith("http://localhost") ? new URL(click.referer).hostname : 'Direct';
            referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
            const device = click.device || 'Unknown';
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
            const browser = click.browser || 'Unknown';
            browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        });

        res.json({ totalClicks: link.clickCount, dailyClicks, countryCounts, referrerCounts, deviceCounts, browserCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching stats.' });
    }
};

// --- UPDATE LINK (This function was likely missing or had a typo) ---
exports.updateLink = async (req, res) => {
    try {
        const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        const { originalUrl, alias, enabled } = req.body;
        if (originalUrl) link.originalUrl = originalUrl;
        if (alias) link.alias = alias;
        if (enabled !== undefined) link.enabled = enabled;
        
        await link.save();
        res.json(link);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// --- DELETE LINK (This function was likely missing or had a typo) ---
exports.deleteLink = async (req, res) => {
    try {
        const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }
        await link.deleteOne();
        res.json({ message: 'Link removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
