require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const redirectController = require('./controllers/redirectController');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter for anonymous shortening
const shortenLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 shorten requests per windowMs
	message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});


// Serve static files from 'public' directory
// Note: Vercel handles this via vercel.json, but this is good for local dev
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));


// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));
app.use('/api/users', require('./routes/users')); // For admin
app.use('/api/ads', require('./routes/ads')); // For admin

// Special API routes
app.post('/api/shorten', shortenLimiter, require('./controllers/linkController').createLink);
app.post('/api/click', require('./controllers/linkController').registerClick);


// Redirect Route - This must be the last route
app.get('/:shortId', redirectController.handleRedirect);

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

// Serve index as a fallback for the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// This check is to avoid running the server when Vercel builds the serverless function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
