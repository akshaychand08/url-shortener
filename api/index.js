require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db'); // Correctly require db connection

// Import controllers
const redirectController = require('./controllers/redirectController');
const linkController = require('./controllers/linkController');

const app = express();

// Trust Proxy for Vercel rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter
const shortenLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: { error: 'Too many requests, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ads', require('./routes/ads'));

// Special API Routes that need the controller directly
app.post('/api/shorten', shortenLimiter, linkController.createLink);
app.post('/api/click', linkController.registerClick);

// Redirect Route
app.get('/:shortId', redirectController.handleRedirect);

// Serve Frontend Static aAssets
app.use(express.static(path.join(__dirname, '../public')));
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Export the app for Vercel
module.exports = app;
