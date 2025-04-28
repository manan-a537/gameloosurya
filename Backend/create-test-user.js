const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const UserModel = mongoose.model('User', userSchema);

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/gaming-website', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('Test user already exists');
            await mongoose.disconnect();
            return;
        }

        // Create new user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword
        });

        await user.save();
        console.log('Test user created successfully');
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
createTestUser(); 