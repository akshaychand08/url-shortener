const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
    getAllAds,
    createAd,
    updateAd,
    deleteAd
} = require('../controllers/adController');

// All routes are protected and for admins only
router.use(protect, admin);

router.route('/').get(getAllAds).post(createAd);
router.route('/:id').put(updateAd).delete(deleteAd);

module.exports = router;
