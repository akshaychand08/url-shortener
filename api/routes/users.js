const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser,
    generateApiKey,
    revokeApiKey
} = require('../controllers/userController');

// All routes here are protected and require admin privileges
router.use(protect, admin);

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

// User-specific actions (could also be on a separate '/api/profile' route)
// For simplicity, we keep them here but an admin could also perform them
router.post('/api-key', protect, generateApiKey); // User generates their own key
router.delete('/api-key/:key', protect, revokeApiKey); // User revokes their own key

module.exports = router;
