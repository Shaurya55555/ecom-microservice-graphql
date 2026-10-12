const Product = require('../models/productModel');
const { emitProductCreatedEvent } = require('../events/productProducer');

// Only these fields may be written by clients; sellerId always comes from the JWT.
const WRITABLE_FIELDS = ['name', 'description', 'price', 'category', 'imageUrl'];

function pickWritable(body = {}) {
  return WRITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
}

// Create a new product (seller/admin only, ownership set from the JWT)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...pickWritable(req.body), sellerId: req.user.userId });
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

// Update a product (owning seller or admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && product.sellerId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }
    product.set(pickWritable(req.body));
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product (owning seller or admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && product.sellerId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await product.deleteOne();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
