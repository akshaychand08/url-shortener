// File: api/controllers/linkController.js

const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const Link = require('../models/Link');
const Click = require('../models/Click');
const jwt = require('jsonwebtoken');

// 💡 STEP 1: Import your database connection utility
const dbConnect = require('../config/db'); // Adjust the path if needed

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
    // 💡 STEP 2: Wait for the database connection first
    await dbConnect();

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
    await dbConnect(); // 👈 Add this line here too!
    // ... rest of the function is the same
};

// --- GET USER'S LINKS ---
exports.getLinks = async (req, res) => {
    await dbConnect(); // 👈 And here!
    // ... rest of the function is the same
};


// --- GET LINK STATS ---
exports.getLinkStats = async (req, res) => {
    await dbConnect(); // 👈 And here!
    // ... rest of the function is the same
};

// --- UPDATE LINK ---
exports.updateLink = async (req, res) => {
    await dbConnect(); // 👈 And here!
    // ... rest of the function is the same
};

// --- DELETE LINK ---
exports.deleteLink = async (req, res) => {
    await dbConnect(); // 👈 And here!
    // ... rest of the function is the same
};
