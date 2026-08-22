const axios = require('axios');
const Order = require('../models/orderModel');
const { produceOrderEvent } = require('../events/orderProducer');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { productId, userId, quantity } = req.body;

    const newOrder = new Order({ productId, userId, quantity });
    await newOrder.save();

    // Produce an order created event to Kafka
    produceOrderEvent(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller accepts or rejects an order placed against one of their products
exports.respondToOrder = async (req, res) => {
  try {
    const { accept } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'seller') {
      const productRes = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/products/${order.productId}`);
      if (String(productRes.data.sellerId) !== String(req.user.userId)) {
        return res.status(403).json({ message: 'You can only respond to requests for your own products' });
      }
    }

    order.status = accept ? 'Accepted' : 'Rejected';
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Orders for products owned by the authenticated seller
exports.getSellerOrders = async (req, res) => {
  try {
    const productsRes = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/products`);
    const myProductIds = new Set(
      productsRes.data.filter((p) => String(p.sellerId) === String(req.user.userId)).map((p) => p._id ?? p.id)
    );
    const orders = await Order.find({ productId: { $in: [...myProductIds] } });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
