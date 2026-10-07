const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Route to create a new product (seller/admin only)
router.post('/', requireAuth, requireRole('seller', 'admin'), createProduct);

// Route to get all products
router.get('/', getProducts);

// Route to get a product by ID
router.get('/:id', getProductById);

// Update / delete a product (owning seller or admin; ownership checked in the controller)
router.put('/:id', requireAuth, requireRole('seller', 'admin'), updateProduct);
router.delete('/:id', requireAuth, requireRole('seller', 'admin'), deleteProduct);

module.exports = router;
