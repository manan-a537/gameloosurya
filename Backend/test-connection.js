const mongoose = require('mongoose');

async function testConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/gaming-website', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Successfully connected to MongoDB!');

        // Create a test collection
        const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
        
        // Insert a test document
        const testDoc = new Test({ name: 'Test Document' });
        await testDoc.save();
        console.log('Test document created successfully!');

        // Find the test document
        const foundDoc = await Test.findOne({ name: 'Test Document' });
        console.log('Found document:', foundDoc);

        // Delete the test document
        await Test.deleteOne({ name: 'Test Document' });
        console.log('Test document deleted successfully!');

    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        // Close the connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testConnection(); 