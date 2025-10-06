// File: scripts/seed-admin.js
```javascript
require('dotenv').config({ path: '../.env' }); // Adjust path if running from project root
const mongoose = require('mongoose');
const User = require('../api/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            throw new Error("ADMIN_EMAIL is not defined in .env file");
        }

        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists.');
            mongoose.connection.close();
            return;
        }

        const adminUser = new User({
            name: process.env.ADMIN_NAME || 'Admin',
            email: adminEmail,
            passwordHash: process.env.ADMIN_PASSWORD, // Hashing happens in model
            isAdmin: true,
        });

        await adminUser.save();
        console.log('Admin user created successfully!');

    } catch (error) {
        console.error('Error seeding admin user:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedAdmin();
