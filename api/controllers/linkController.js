// File: api/controllers/linkController.js
const { nanoid } = require('nanoid');
const Link = require('../models/Link');
const connectDB = require('../config/db');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            return jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET).id;
        } catch (e) { return null; }
    }
    return null;
};

exports.createLink = async (req, res) => {
    try {
        await connectDB();
        const { originalUrl } = req.body;
        if (!originalUrl) return res.status(400).json({ error: 'Original URL is required' });
        
        const ownerId = getUserIdFromToken(req);
        let shortId;
        do { shortId = nanoid(7); } while (await Link.findOne({ shortId }));
        
        const link = await Link.create({ originalUrl, shortId, owner: ownerId });
        res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${link.shortId}` });
    } catch (error) {
        console.error("Shorten Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getLinks = async (req, res) => {
    try {
        await connectDB();
        const links = await Link.find({ owner: req.user._id });
        res.json(links);
    } catch (error) {
        console.error("Get Links Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// --- ADDED MISSING FUNCTIONS ---

exports.updateLink = async (req, res) => {
    try {
        await connectDB();
        const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });
        if (!link) return res.status(404).json({ error: 'Link not found' });

        const { originalUrl, enabled } = req.body;
        if (originalUrl) link.originalUrl = originalUrl;
        if (enabled !== undefined) link.enabled = enabled;
        
        await link.save();
        res.json(link);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.deleteLink = async (req, res) => {
    try {
        await connectDB();
        const link = await Link.findOne({ _id: req.params.id, owner: req.user._id });
        if (!link) return res.status(404).json({ error: 'Link not found' });
        
        await link.deleteOne();
        res.json({ message: 'Link removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};
