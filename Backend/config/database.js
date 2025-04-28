const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/gaming-website', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Event listeners for connection monitoring
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 