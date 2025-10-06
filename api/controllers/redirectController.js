const Link = require('../models/Link');
const AdSnippet = require('../models/AdSnippet');

exports.handleRedirect = async (req, res) => {
    const { shortId } = req.params;

    try {
        // Find by alias or shortId
        const link = await Link.findOne({ $or: [{ shortId }, { alias: shortId }] });

        if (!link) {
            return res.status(404).send('<h1>Link not found.</h1>');
        }

        // 1. Check if enabled
        if (!link.enabled) {
            return res.status(403).send('<h1>This link has been disabled.</h1>');
        }

        // 2. Check for expiry
        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            link.enabled = false;
            await link.save();
            return res.status(410).send('<h1>This link has expired.</h1>');
        }

        // 3. Check for password
        if (link.passwordHash) {
            return res.status(401).send('<h1>This link is password protected.</h1>');
        }

        // 4. Serve Interstitial Page
        const ad = await AdSnippet.findOne({ active: true });
        
        res.setHeader('Content-Type', 'text/html');
        // This is the part to fix. The entire HTML block must be inside backticks `.
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redirecting...</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; text-align: center; }
                    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .ad-slot { margin: 20px 0; min-height: 90px; min-width: 300px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; }
                    .timer { font-size: 24px; margin: 20px 0; }
                    #progressBarContainer { width: 100%; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; }
                    #progressBar { width: 0%; height: 10px; background-color: #4caf50; transition: width 1s linear; }
                    #skipBtn { padding: 10px 20px; font-size: 16px; cursor: pointer; border: none; border-radius: 4px; background-color: #cccccc; color: #666; margin-top: 20px; }
                    #skipBtn:not(:disabled) { background-color: #007bff; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Please wait...</h1>
                    <p>You will be redirected shortly.</p>
                    <div class="ad-slot">
                        ${ad ? ad.html : 'Advertisement'}
                    </div>
                    <div id="progressBarContainer"><div id="progressBar"></div></div>
                    <div class="timer" id="countdown">15</div>
                    <button id="skipBtn" disabled>Skip Ad</button>
                </div>

                <script>
                    const linkId = "${link._id}";
                    const originalUrl = "${link.originalUrl}";
                    const countdownEl = document.getElementById('countdown');
                    const skipBtn = document.getElementById('skipBtn');
                    const progressBar = document.getElementById('progressBar');
                    let timeLeft = 15;
                    let redirected = false;

                    function doRedirect() {
                        if (redirected) return;
                        redirected = true;
                        
                        try {
                            navigator.sendBeacon('/api/click', JSON.stringify({ linkId }));
                        } catch (e) {
                            fetch('/api/click', { method: 'POST', body: JSON.stringify({ linkId }), keepalive: true });
                        }
                        window.location.href = originalUrl;
                    }

                    const interval = setInterval(() => {
                        timeLeft--;
                        countdownEl.textContent = timeLeft;
                        progressBar.style.width = ((15 - timeLeft) / 15) * 100 + '%';

                        if (timeLeft <= 0) {
                            clearInterval(interval);
                            skipBtn.disabled = false;
                            doRedirect();
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        if (timeLeft > 0) { // Only enable if countdown is not already finished
                           skipBtn.disabled = false;
                        }
                    }, 15000);

                    skipBtn.addEventListener('click', () => {
                        clearInterval(interval);
                        doRedirect();
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('<h1>Server error.</h1>');
    }
};
