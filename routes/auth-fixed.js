const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register new user - FIXED VERSION
router.post('/register', async (req, res) => {
    try {
        console.log('Registration started - FIXED VERSION');
        console.log('Request body:', req.body);
        
        const { username, email, password, role } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email, and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        console.log('Checking for existing user...');
        
        // Use direct MongoDB connection
        const db = mongoose.connection.db;
        
        // Check if user already exists
        const existingUser = await db.collection('users').findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        console.log('Creating new user...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user document
        const userDocument = {
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            createdAt: new Date()
        };

        // Insert directly into MongoDB
        const result = await db.collection('users').insertOne(userDocument);
        
        console.log('User created successfully:', result.insertedId);

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertedId, username, role: userDocument.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertedId,
                username,
                email,
                role: userDocument.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login user - FIXED VERSION
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt started - FIXED VERSION');
        const { username, password } = req.body;
        console.log('Username/Email:', username);

        // Use direct MongoDB connection
        const db = mongoose.connection.db;
        
        // Find user by username or email
        const user = await db.collection('users').findOne({
            $or: [{ username }, { email: username }]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Comparing password...');
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Generating token...');
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful');
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

module.exports = router;
