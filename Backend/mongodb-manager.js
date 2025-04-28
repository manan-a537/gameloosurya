const mongoose = require('mongoose');
const User = require('./models/User'); // We'll create this model next

class MongoDBManager {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mongoose.connect('mongodb://localhost:27017/gaming-website', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }

    // User Management
    async createUser(username, email, password) {
        try {
            const user = new User({ username, email, password });
            await user.save();
            console.log('User created successfully:', user);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findUserByEmail(email) {
        try {
            const user = await User.findOne({ email });
            return user;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async updateUser(email, updates) {
        try {
            const user = await User.findOneAndUpdate(
                { email },
                { $set: updates },
                { new: true }
            );
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(email) {
        try {
            const result = await User.findOneAndDelete({ email });
            return result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Database Management
    async clearDatabase() {
        try {
            await User.deleteMany({});
            console.log('Database cleared successfully');
        } catch (error) {
            console.error('Error clearing database:', error);
            throw error;
        }
    }

    async getDatabaseStats() {
        try {
            const stats = await mongoose.connection.db.stats();
            console.log('Database statistics:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
}

module.exports = MongoDBManager; 