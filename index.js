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
    // REMOVED: process.exit(1) was causing crashes on Vercel
  }
};

connectDB();

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Routes ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/shorten', async (req, res) => {
  const { fullUrl } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

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
    let url = await Url.findOne({ fullUrl });
    if (url) {
      return res.status(200).json(url);
    }

    const shortCode = nanoid(8);
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    url = new Url({
      fullUrl,
      shortCode,
      shortUrl,
      clicks: 0,
    });

    await url.save();
    res.status(201).json(url);

  } catch (err) {
    console.error('Error in /shorten:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

app.get('/s/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.fullUrl);
    } else {
      return res.status(404).send("URL Not Found");
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

