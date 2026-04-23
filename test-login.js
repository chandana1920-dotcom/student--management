const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the admin user
        const adminUser = await User.findOne({ username: 'admin' });
        
        if (!adminUser) {
            console.log('❌ Admin user not found');
            return;
        }

        console.log('✅ Admin user found:');
        console.log('   Username:', adminUser.username);
        console.log('   Email:', adminUser.email);
        console.log('   Role:', adminUser.role);
        
        // Test password comparison
        const isMatch = await adminUser.comparePassword('admin123');
        console.log('   Password match:', isMatch);

        if (isMatch) {
            console.log('🎉 Login should work with:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        } else {
            console.log('❌ Password does not match');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testLogin();
