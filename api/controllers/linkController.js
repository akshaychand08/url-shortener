// File: api/controllers/linkController.js
const { nanoid } = require('nanoid');
const Link = require('../models/Link');
const connectDB = require('../config/db');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            return jwt.verify(token, process.env.JWT_SECRET).id;
        } catch (e) { return null; }
    }
    return null;
};

exports.createLink = async (req, res) => {
    try {
        await connectDB();
        const { originalUrl } = req.body;
        if (!originalUrl) {
            return res.status(400).json({ error: 'Original URL is required' });
        }
        const ownerId = getUserIdFromToken(req);
        let shortId;
        do { shortId = nanoid(7); } while (await Link.findOne({ shortId }));
        
        const link = await Link.create({ originalUrl, shortId, owner: ownerId });
        res.status(201).json({ shortUrl: `${process.env.BASE_URL}/${link.shortId}` });
    } catch (error) {
        console.error("Shorten Error:", error);
        res.status(500).json({ error: 'Server error while creating link.' });
    }
};

exports.getLinks = async (req, res) => {
    try {
        await connectDB();
        const links = await Link.find({ owner: req.user._id });
        res.json(links);
    } catch (error) {
        console.error("Get Links Error:", error);
        res.status(500).json({ error: 'Server error fetching links.' });
    }
};
