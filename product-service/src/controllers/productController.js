const Product = require('../models/productModel');
const { emitProductCreatedEvent } = require('../events/productProducer');

// Create a new product (seller/admin only, ownership set from the JWT)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, sellerId: req.user.userId });
    emitProductCreatedEvent(product); // Emit event after creating product
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
