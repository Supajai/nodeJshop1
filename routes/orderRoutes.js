const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User creates order (with slip image)
router.post('/', authenticateToken, upload.single('slipImage'), orderController.createOrder);

// User views their own history
router.get('/my-orders', authenticateToken, orderController.getUserOrders);

// Admin routes
router.get('/stats', authenticateToken, verifyAdmin, orderController.getDashboardStats);
router.get('/', authenticateToken, verifyAdmin, orderController.getAllOrders);
router.put('/:id', authenticateToken, verifyAdmin, orderController.updateOrderStatus);

module.exports = router;