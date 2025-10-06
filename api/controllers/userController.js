
// File: api/controllers/userController.js
```javascript
const User = require('../models/User');
const { nanoid } = require('nanoid');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-passwordHash');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    // Admin can change roles, premium status etc.
    const { name, email, isAdmin, isPremium } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
        user.isPremium = isPremium !== undefined ? isPremium : user.isPremium;
        
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Consider what to do with user's links. For now, we'll leave them ownerless.
        await user.remove();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Generate an API key for the logged-in user
// @route   POST /api/users/api-key
// @access  Private
exports.generateApiKey = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newKey = { key: `sk_${nanoid(32)}` }; // "sk" for secret key
        user.apiKeys.push(newKey);
        await user.save();
        res.status(201).json({ apiKey: newKey.key, message: "API key generated. Save it now, you won't see it again." });
    } catch (error) {
        res.status(500).json({ error: 'Server error while generating key.' });
    }
};

// @desc    Revoke an API key
// @route   DELETE /api/users/api-key/:key
// @access  Private
exports.revokeApiKey = async (req, res) => {
    try {
        const { key } = req.params;
        const user = await User.findById(req.user._id);
        const keyIndex = user.apiKeys.findIndex(apiKey => apiKey.key === key);
        
        if (keyIndex === -1) {
            return res.status(404).json({ error: 'API key not found.' });
        }

        user.apiKeys[keyIndex].revoked = true;
        await user.save();
        res.json({ message: 'API key revoked successfully.' });

    } catch (error) {
        res.status(500).json({ error: 'Server error while revoking key.' });
    }
};
