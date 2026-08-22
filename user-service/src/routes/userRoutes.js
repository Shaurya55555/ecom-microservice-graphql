const express = require('express');
const { registerUser, loginUser, getAccounts, setUserActive } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Admin: list all accounts
router.get('/', requireAuth, requireRole('admin'), getAccounts);

// Admin: activate/deactivate an account
router.patch('/:id/active', requireAuth, requireRole('admin'), setUserActive);

module.exports = router;
