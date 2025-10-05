require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid'); // NEW: Using nanoid for unique IDs
const path = require('path');
const Url = require('./models/url');

const app = express();

// --- MongoDB Connection ---
// The old options (useNewUrlParser, useUnifiedTopology) are no longer needed
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Root route to serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to create a short URL
app.post('/shorten', async (req, res) => {
  const { fullUrl } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // NEW: Validate the URL format
  try {
    new URL(fullUrl);
  } catch (error) {
    return res.status(400).send({ error: 'Invalid URL format. Please enter a valid URL.' });
  }

  try {
    // Check if the long URL already exists in the database
    let url = await Url.findOne({ fullUrl });
    if (url) {
      return res.json(url);
    }

    // If it doesn't exist, create a new short URL
    const shortCode = nanoid(8); // CHANGED: Using nanoid() with 8 characters
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    url = new Url({
      fullUrl,
      shortCode: shortCode,
      shortUrl: shortUrl,
      clicks: 0
    });

    await url.save();
    res.status(201).json(url); // Use 201 status for resource creation

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error. Please try again.' });
  }
});

// API endpoint to redirect to the full URL
app.get('/s/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (url) {
      // Robustly handle clicks
      if (typeof url.clicks !== 'number') {
        url.clicks = 0;
      }
      url.clicks++;
      await url.save();
      return res.redirect(url.fullUrl);
    } else {
      // If not found, send a more informative 404 page or message
      return res.status(404).send('URL not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Export the app for Vercel
module.exports = app;
