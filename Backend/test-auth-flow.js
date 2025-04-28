const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function testAuthFlow() {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/gaming-website');
        console.log('Connected to MongoDB');

        // 2. Register a new user
        const newUser = {
            username: 'gameuser1',
            email: 'gameuser1@example.com',
            password: 'password123'
        };

        // Hash the password
        const hashedPassword = await bcrypt.hash(newUser.password, 10);
        
        // Create user in database
        const user = new User({
            ...newUser,
            password: hashedPassword
        });
        
        await user.save();
        console.log('User registered successfully:', {
            username: user.username,
            email: user.email
        });

        // 3. Test Login
        const loginAttempt = await User.findOne({ email: newUser.email });
        if (loginAttempt) {
            const validPassword = await bcrypt.compare(newUser.password, loginAttempt.password);
            if (validPassword) {
                // Generate JWT token
                const token = jwt.sign(
                    { userId: loginAttempt._id },
                    'your-secret-key',
                    { expiresIn: '24h' }
                );
                console.log('Login successful! Token:', token);
            }
        }

        // 4. Verify stored data
        const storedUser = await User.findOne({ email: newUser.email });
        console.log('Stored user data:', {
            username: storedUser.username,
            email: storedUser.email,
            createdAt: storedUser.createdAt
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testAuthFlow(); 