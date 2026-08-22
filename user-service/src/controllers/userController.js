const User = require('../models/userModel');  // Ensure the path is correct
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
const PUBLIC_ROLES = ['user', 'seller'];

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if the required fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        if (role && !PUBLIC_ROLES.includes(role)) {
            return res.status(400).json({ message: `role must be one of: ${PUBLIC_ROLES.join(', ')}` });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login user and return user ID
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.active === false) {
            return res.status(403).json({ message: 'This account has been disabled' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// List all accounts (admin only)
const getAccounts = async (req, res) => {
    try {
        const users = await User.find().select('username email role active');
        res.status(200).json(users.map((u) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            active: u.active !== false,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
};

// Activate/deactivate an account (admin only)
const setUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot deactivate an admin account' });
        }
        user.active = req.body.active;
        await user.save();
        res.status(200).json({ id: user._id, username: user.username, email: user.email, role: user.role, active: user.active });
    } catch (error) {
        res.status(500).json({ message: 'Error updating account', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAccounts,
    setUserActive,
};
