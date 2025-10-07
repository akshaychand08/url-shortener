const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
    country: { type: String },
    referer: { type: String },
    device: { type: String },
    browser: { type: String }
});

module.exports = mongoose.model('Click', ClickSchema);
