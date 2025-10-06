const mongoose = require('mongoose');

const AdSnippetSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    html: { type: String, required: true },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('AdSnippet', AdSnippetSchema);
