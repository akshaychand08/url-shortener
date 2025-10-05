require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const path = require('path'); // Yeh line add ki gayi hai
const Url = require('./models/url');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// Middleware
app.use(express.static('public')); // Serve static files from 'public' folder
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// ==========================================================
// === YEH CODE BLOCK ADD KIYA GAYA HAI PROBLEM FIX KARNE KE LIYE ===
// Root route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ==========================================================


// API endpoint to create a short URL
app.post('/shorten', async (req, res) => {
  const { fullUrl } = req.body;
  if (!fullUrl) {
    return res.status(400).send({ error: 'URL is required' });
  }

  try {
    let url = await Url.findOne({ fullUrl });
    if (url) {
      res.json(url);
    } else {
      const shortUrl = shortid.generate();
      url = new Url({
        fullUrl,
        shortUrl,
        clicks: 0
      });
      await url.save();
      res.json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});

// API endpoint to redirect to the full URL
app.get('/:shortUrl', async (req, res) => {
  // Yeh check zaroori hai taaki 'shorten' jaise path ko short URL na samjha jaye
  if (req.params.shortUrl === 'shorten') {
    return next();
  }
  
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.fullUrl);
    } else {
      return res.status(404).send('URL not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Export the app for Vercel
module.exports = app;
