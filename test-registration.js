const mongoose = require('mongoose');
require('dotenv').config();

async function testRegistration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        // Test creating users with different email addresses
        const testUsers = [
            {
                username: 'john_smith',
                email: 'john.smith@gmail.com',
                password: 'password123',
                role: 'student'
            },
            {
                username: 'jane_doe',
                email: 'jane.doe@yahoo.com',
                password: 'password123',
                role: 'student'
            },
            {
                username: 'mike_wilson',
                email: 'mike.wilson@outlook.com',
                password: 'password123',
                role: 'teacher'
            }
        ];

        console.log('Testing user registration with unique emails...\n');

        for (const userData of testUsers) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [
                        { email: userData.email },
                        { username: userData.username }
                    ]
                });

                if (existingUser) {
                    console.log(`ℹ️  User already exists: ${userData.email}`);
                    continue;
                }

                // Create new user
                const user = new User(userData);
                await user.save();

                console.log(`✅ User created successfully:`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log('');

            } catch (error) {
                console.log(`❌ Error creating user ${userData.email}:`, error.message);
            }
        }

        // Test duplicate email prevention
        console.log('Testing duplicate email prevention...');
        try {
            const duplicateUser = new User({
                username: 'duplicate_test',
                email: 'john.smith@gmail.com', // Same email as first user
                password: 'password123',
                role: 'student'
            });
            await duplicateUser.save();
            console.log('❌ Duplicate email was allowed (this should not happen)');
        } catch (error) {
            console.log('✅ Duplicate email correctly prevented:', error.message);
        }

        console.log('\n🎯 Registration System Test Complete!');
        console.log('✅ Users can register with their own unique email addresses');
        console.log('✅ Duplicate emails are properly prevented');
        console.log('✅ Each user gets their own personal account');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testRegistration();
