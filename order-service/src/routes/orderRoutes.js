const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, requireRole('user'), orderController.createOrder); // Buyer creates a request
router.get('/seller', requireAuth, requireRole('seller'), orderController.getSellerOrders); // Requests for the seller's products
router.patch('/:id/status', requireAuth, requireRole('seller', 'admin'), orderController.respondToOrder); // Accept/reject a request
router.get('/', orderController.getAllOrders); // Get all orders
router.get('/:id', orderController.getOrderById); // Get order by ID

module.exports = router;
