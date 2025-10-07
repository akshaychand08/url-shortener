const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const Link = require('../models/Link');
const Click = require('../models/Click');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');

const getUserIdFromToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            return jwt.verify(token, process.env.JWT_SECRET).id;
        } catch (error) { return null; }
    }
    return null;
};

exports.createLink = async (req, res) => {
    await connectDB(); // Ensure DB connection for serverless
    // ... function logic ...
};
// NOTE: Add "await connectDB();" to the top of EVERY exported function below
// to prevent the Mongoose connection error in a serverless environment.

exports.registerClick = async (req, res) => {
    await connectDB();
    // ... function logic ...
};
exports.getLinks = async (req, res) => {
    await connectDB();
    // ... function logic ...
};
exports.getLinkStats = async (req, res) => {
    await connectDB();
    // ... function logic ...
};
exports.updateLink = async (req, res) => {
    await connectDB();
    // ... function logic ...
};
exports.deleteLink = async (req, res) => {
    await connectDB();
    // ... function logic ...
};
