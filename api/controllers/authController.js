const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const connectDB = require('../config/db'); // 👈 STEP 1: IMPORT

// ... (keep the generateToken function as is) ...

exports.signup = async (req, res) => {
    await connectDB(); // 👈 STEP 2: AWAIT CONNECTION
    // ... rest of the function is the same
};

exports.login = async (req, res) => {
    await connectDB(); // 👈 STEP 2: AWAIT CONNECTION
    // ... rest of the function is the same
};
