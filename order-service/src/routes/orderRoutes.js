const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, orderController.createOrder); // Create a new order (auth required)
router.get('/', orderController.getAllOrders); // Get all orders
router.get('/:id', orderController.getOrderById); // Get order by ID

module.exports = router;
