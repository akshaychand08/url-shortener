// File: api/controllers/redirectController.js
```javascript
const Link = require('../models/Link');
const AdSnippet = require('../models/AdSnippet');

exports.handleRedirect = async (req, res) => {
    const { shortId } = req.params;

    try {
        // Find by alias or shortId
        const link = await Link.findOne({ $or: [{ shortId }, { alias: shortId }] });

        if (!link) {
            return res.status(404).send('Link not found.');
        }

        // 1. Check if enabled
        if (!link.enabled) {
            return res.status(403).send('This link has been disabled.');
        }

        // 2. Check for expiry
        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            // Optionally disable the link in the DB
            link.enabled = false;
            await link.save();
            return res.status(410).send('This link has expired.');
        }

        // 3. Check for password
        // This is a simplified flow. A real app would present a password form.
        // For this implementation, we just block access if a password is set.
        if (link.passwordHash) {
            // For a full implementation, you'd serve a page asking for the password.
            // Here we'll just show a generic message.
            return res.status(401).send('This link is password protected.');
        }

        // 4. Serve Interstitial Page
        const ad = await AdSnippet.findOne({ active: true }); // Get any active ad
        
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Redirecting...</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                    .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
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
                        ${ad ? ad.html : 'Ad content goes here.'}
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
                        
                        // Register click in the background and then redirect
                        navigator.sendBeacon('/api/click', JSON.stringify({ linkId }));
                        window.location.href = originalUrl;
                    }

                    const interval = setInterval(() => {
                        timeLeft--;
                        countdownEl.textContent = timeLeft;
                        progressBar.style.width = ((15 - timeLeft) / 15) * 100 + '%';

                        if (timeLeft <= 0) {
                            clearInterval(interval);
                            doRedirect();
                        }
                    }, 1000);
                    
                    setTimeout(() => {
                        skipBtn.disabled = false;
                    }, 15000);

                    skipBtn.addEventListener('click', doRedirect);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Server error.');
    }
};
