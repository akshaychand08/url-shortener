
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
    try {
        await connectDB(); // This line ensures the database is connected
        const { email, password } = req.body;
        if (!email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Please provide a valid email and a password of at least 6 characters.' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }
        const user = await User.create({ email, passwordHash: password });
        res.status(201).json({ token: generateToken(user._id), email: user.email });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Server error during signup.' });
    }
};

exports.login = async (req, res) => {
    try {
        await connectDB(); // This line ensures the database is connected
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password.' });
        }
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({ token: generateToken(user._id), email: user.email });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};
