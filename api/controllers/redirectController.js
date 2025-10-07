const Link = require('../models/Link');
const Click = require('../models/Click');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const connectDB = require('../config/db'); // 👈 STEP 1: IMPORT DB CONNECTION

exports.handleRedirect = async (req, res) => {
    try {
        await connectDB(); // 👈 STEP 2: WAIT FOR CONNECTION (YAHI FIX HAI)

        const { shortId } = req.params;

        // Ignore requests for favicon.ico
        if (shortId === 'favicon.ico') {
            return res.status(204).send(); // No Content
        }

        const link = await Link.findOne({ shortId });

        if (!link) {
            return res.status(404).send('<h1>Link not found.</h1>');
        }

        // --- Track the click (optional, but good to have) ---
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip);
        const agent = useragent.parse(req.headers['user-agent']);

        const click = new Click({
            linkId: link._id,
            ip: ip.split(',')[0].trim(),
            country: geo ? geo.country : 'Unknown',
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer || 'Direct',
        });
        await click.save();
        await Link.updateOne({ _id: link._id }, { $inc: { clickCount: 1 } });
        // --- End of tracking ---

        // Finally, redirect to the original URL
        res.redirect(301, link.originalUrl);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('<h1>Server error.</h1>');
    }
};
