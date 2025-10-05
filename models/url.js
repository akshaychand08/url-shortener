const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  fullUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  shortUrl: {
    type: String,
    required: true,
  },
  // === YEH FIELD HONA ZAROORI HAI ===
  clicks: {
    type: Number,
    required: true,
    default: 0
  }
  // ===================================
});

module.exports = mongoose.model('Url', urlSchema);
