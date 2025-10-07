// File: api/routes/links.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createLink,
    getLinks,
    updateLink,
    deleteLink
} = require('../controllers/linkController');

// For creating a link (can be public or authenticated)
router.post('/', createLink);

// For managing links (must be authenticated)
router.route('/user')
    .get(protect, getLinks);

router.route('/:id')
    .put(protect, updateLink)
    .delete(protect, deleteLink);

module.exports = router;
