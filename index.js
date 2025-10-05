require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const path = require('path'); 
const Url = require('./models/url');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// ==========================================================
// === YEH LINE BADLI GAYI HAI PROBLEM FIX KARNE KE LIYE ===
// Serve static files from the 'public' directory using an absolute path
app.use(express.static(path.join(__dirname, 'public')));
// ==========================================================

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Root route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
app.get('/:shortUrl', async (req, res, next) => {
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
      return res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Optional: a 404 page
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
