const AdSnippet = require('../models/AdSnippet');

// @desc    Get all ad snippets
// @route   GET /api/ads
// @access  Private/Admin
exports.getAllAds = async (req, res) => {
    try {
        const ads = await AdSnippet.find({});
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Create an ad snippet
// @route   POST /api/ads
// @access  Private/Admin
exports.createAd = async (req, res) => {
    const { name, html, active } = req.body;
    if (!name || !html) {
        return res.status(400).json({ error: 'Name and HTML content are required.' });
    }
    try {
        // Prevent XSS - In a real app, use a sanitizer like DOMPurify on the frontend
        // before sending, and potentially on the backend as an extra layer.
        // For this project, we trust the admin.
        const ad = new AdSnippet({ name, html, active });
        const createdAd = await ad.save();
        res.status(201).json(createdAd);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update an ad snippet
// @route   PUT /api/ads/:id
// @access  Private/Admin
exports.updateAd = async (req, res) => {
    const { name, html, active } = req.body;
    try {
        const ad = await AdSnippet.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ error: 'Ad snippet not found.' });
        }
        ad.name = name || ad.name;
        ad.html = html || ad.html;
        ad.active = active !== undefined ? active : ad.active;

        const updatedAd = await ad.save();
        res.json(updatedAd);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete an ad snippet
// @route   DELETE /api/ads/:id
// @access  Private/Admin
exports.deleteAd = async (req, res) => {
    try {
        const ad = await AdSnippet.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ error: 'Ad snippet not found.' });
        }
        await ad.remove();
        res.json({ message: 'Ad snippet removed.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
