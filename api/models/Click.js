const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String }, // Hashed or partial IP
    userAgent: { type: String },
    country: { type: String },
    referer: { type: String },
    device: { type: String },
    browser: { type: String }
});

ClickSchema.index({ linkId: 1, timestamp: -1 });

module.exports = mongoose.model('Click', ClickSchema);
