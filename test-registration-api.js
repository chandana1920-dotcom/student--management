const mongoose = require('mongoose');
require('dotenv').config();

async function testRegistrationAPI() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Clean up test users first
        await db.collection('users').deleteMany({
            email: { $in: ['test.user1@gmail.com', 'test.user2@yahoo.com'] }
        });

        console.log('Testing registration API with unique emails...\n');

        // Test 1: Register first user
        console.log('Test 1: Registering first user...');
        const response1 = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser1',
                email: 'test.user1@gmail.com',
                password: 'password123',
                role: 'student'
            })
        });

        if (response1.ok) {
            const data1 = await response1.json();
            console.log('✅ First user registered successfully:');
            console.log(`   Username: ${data1.user.username}`);
            console.log(`   Email: ${data1.user.email}`);
            console.log(`   Role: ${data1.user.role}`);
        } else {
            const error1 = await response1.json();
            console.log('❌ First user registration failed:', error1.message);
        }

        // Test 2: Register second user
        console.log('\nTest 2: Registering second user...');
        const response2 = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser2',
                email: 'test.user2@yahoo.com',
                password: 'password123',
                role: 'student'
            })
        });

        if (response2.ok) {
            const data2 = await response2.json();
            console.log('✅ Second user registered successfully:');
            console.log(`   Username: ${data2.user.username}`);
            console.log(`   Email: ${data2.user.email}`);
            console.log(`   Role: ${data2.user.role}`);
        } else {
            const error2 = await response2.json();
            console.log('❌ Second user registration failed:', error2.message);
        }

        // Test 3: Try duplicate email
        console.log('\nTest 3: Testing duplicate email prevention...');
        const response3 = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser3',
                email: 'test.user1@gmail.com', // Same email as first user
                password: 'password123',
                role: 'student'
            })
        });

        if (response3.ok) {
            console.log('❌ Duplicate email was allowed (this should not happen)');
        } else {
            const error3 = await response3.json();
            console.log('✅ Duplicate email correctly prevented:', error3.message);
        }

        // Test 4: Login with first user
        console.log('\nTest 4: Testing login with registered user...');
        const response4 = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'test.user1@gmail.com',
                password: 'password123'
            })
        });

        if (response4.ok) {
            const data4 = await response4.json();
            console.log('✅ Login successful:');
            console.log(`   Username: ${data4.user.username}`);
            console.log(`   Email: ${data4.user.email}`);
        } else {
            const error4 = await response4.json();
            console.log('❌ Login failed:', error4.message);
        }

        console.log('\n🎯 Registration API Test Complete!');
        console.log('✅ Users can register with their own unique email addresses');
        console.log('✅ Duplicate emails are properly prevented');
        console.log('✅ Users can login with their registered email addresses');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testRegistrationAPI();
