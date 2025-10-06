// --- Imports and Initial Setup ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const path = require('path');
const Url = require('./models/url');

const app = express();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// --- Middleware ---
// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));


// --- Routes ---

/**
 * @route   GET /
 * @desc    Serve the frontend HTML page
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * @route   POST /shorten
 * @desc    Create a new short URL
 */
app.post('/shorten', async (req, res) => {
  const { fullUrl } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // ADDED: More robust URL validation
  let urlObject;
  try {
    urlObject = new URL(fullUrl);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
    return res.status(400).json({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' });
  }

  try {
    // Check if the URL has already been shortened
    let url = await Url.findOne({ fullUrl });
    if (url) {
      return res.status(200).json(url);
    }

    // If not, create a new entry
    const shortCode = nanoid(8);
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    url = new Url({
      fullUrl,
      shortCode,
      shortUrl,
      clicks: 0,
    });

    await url.save();
    res.status(201).json(url); // 201: Created

  } catch (err) {
    console.error('Error in /shorten:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/**
 * @route   GET /s/:shortCode
 * @desc    Redirect to the original long URL
 */
app.get('/s/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.fullUrl);
    } else {
      // If the code doesn't exist, send a 404
      return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
  } catch (err) {
    console.error('Error in /s/:shortCode:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Export the app for Vercel
module.exports = app;
