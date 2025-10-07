
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { handleRedirect } = require('./controllers/redirectController');
const { createLink } = require('./controllers/linkController');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/shorten', createLink);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

// --- FIX: Specific page routes must come BEFORE the general redirect route ---
// Serve frontend pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

// Redirect Route - This must be after specific routes like /dashboard
app.get('/:shortId', handleRedirect);

// Root Fallback - Should be last
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
