const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    shortId: { type: String, required: true, unique: true },
    alias: { type: String, unique: true, sparse: true },
    originalUrl: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    clickCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    passwordHash: { type: String, default: null },
    enabled: { type: Boolean, default: true },
});

module.exports = mongoose.model('Link', LinkSchema);
