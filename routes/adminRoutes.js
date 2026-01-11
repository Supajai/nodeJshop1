const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

console.log('[Server] Admin Routes Loaded');

// Route: /api/admin/stats
router.get('/stats', authenticateToken, verifyAdmin, (req, res, next) => {
    console.log(`[Server] GET /api/admin/stats requested by user ${req.user.userId}`);
    next();
}, orderController.getDashboardStats);

module.exports = router;
