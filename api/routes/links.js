const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getLinks,
    getLinkStats,
    updateLink,
    deleteLink
} = require('../controllers/linkController');

// All routes in this file are for authenticated users
router.use(protect);

router.route('/').get(getLinks);
router.route('/:id').put(updateLink).delete(deleteLink);
router.route('/:shortId/stats').get(getLinkStats);

module.exports = router;
