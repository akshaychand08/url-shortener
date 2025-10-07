// File: api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { handleRedirect } = require('./controllers/redirectController');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/links', require('./routes/links'));

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

// Redirect Route
app.get('/:shortId', handleRedirect);

// Serve frontend pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
