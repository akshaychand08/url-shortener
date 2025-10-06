const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRES_IN || '1d',
    });
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all fields.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Please provide a valid email.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const user = await User.create({
            name,
            email,
            passwordHash: password, // Hashing is done in the model pre-save hook
        });

        res.status(201).json({
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Server error during signup.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login.' });
    }
};
