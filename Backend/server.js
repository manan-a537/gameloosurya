const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const { FB } = require('fb');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gaming-website';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5000';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Game = require('./models/Game');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Review = require('./models/Review');

// Google OAuth Configuration
const googleClient = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${BASE_URL}/auth/google/callback`
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

// Google OAuth Endpoints
app.get('/auth/google', (req, res) => {
    const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent',
        include_granted_scopes: true
    });
    res.redirect(url);
});

// Define the /auth-failure route
app.get('/auth-failure', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/auth-failure.html'));
});

// Define the /auth-success route
app.get('/auth-success', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/auth-success.html'));
});

// Update the Google OAuth callback route with detailed logging
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) throw new Error('No authorization code received');

        console.log('Authorization code received:', code);

        // Exchange code for tokens
        const { tokens } = await googleClient.getToken(code);
        console.log('Tokens received:', tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: GOOGLE_CLIENT_ID
        });
        console.log('ID Token verified:', ticket);

        const { sub, email, name, picture } = ticket.getPayload();
        console.log('User info from ID Token:', { sub, email, name, picture });

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
        if (!user) {
            console.log('User not found, creating new user');
            user = new User({
                username: name,
                email,
                googleId: sub,
                picture,
                isVerified: true
            });
            await user.save();
        } else if (!user.googleId) {
            console.log('User found, updating Google ID and picture');
            user.googleId = sub;
            user.picture = picture;
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('JWT generated:', token);

        // Redirect to success page with token
        res.redirect(`${BASE_URL}/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.username,
            email: user.email,
            picture: user.picture
        }))}`);
    } catch (err) {
        console.error('Google OAuth error:', err);
        res.redirect(`${BASE_URL}/auth-failure?error=${encodeURIComponent(err.message)}`);
    }
});

// Token-based Google Login
app.post('/api/google-login', async (req, res) => {
    try {
        const { tokenId } = req.body;
        if (!tokenId) return res.status(400).json({ success: false, message: 'Token ID required' });

        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: GOOGLE_CLIENT_ID
        });

        const { sub, email, name, picture } = ticket.getPayload();

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
        if (!user) {
            user = new User({
                username: name,
                email,
                googleId: sub,
                picture,
                isVerified: true
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = sub;
            user.picture = picture;
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Google login failed',
            error: err.message 
        });
    }
});

// Other routes
app.use('/api/auth', authRoutes);

// Static files and error handling
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on ${BASE_URL}`);
    console.log('Google OAuth configured');
});