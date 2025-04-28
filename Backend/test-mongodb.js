const MongoDBManager = require('./mongodb-manager');

async function testMongoDB() {
    const mongoManager = new MongoDBManager();

    try {
        // Connect to MongoDB
        await mongoManager.connect();

        // Test creating a user
        const testUser = await mongoManager.createUser(
            'testuser',
            'test@example.com',
            'password123'
        );
        console.log('Created test user:', testUser);

        // Test finding a user
        const foundUser = await mongoManager.findUserByEmail('test@example.com');
        console.log('Found user:', foundUser);

        // Test updating a user
        const updatedUser = await mongoManager.updateUser('test@example.com', {
            username: 'updateduser'
        });
        console.log('Updated user:', updatedUser);

        // Test database stats
        const stats = await mongoManager.getDatabaseStats();
        console.log('Database stats:', stats);

        // Test deleting a user
        const deletedUser = await mongoManager.deleteUser('test@example.com');
        console.log('Deleted user:', deletedUser);

        // Clear the database (optional)
        // await mongoManager.clearDatabase();

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoManager.disconnect();
    }
}

// Run the test
testMongoDB(); 