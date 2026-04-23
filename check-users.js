const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define user schema
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true },
            email: { type: String, required: true },
            role: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Find all users
        const users = await User.find({}, '-password');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('📝 Please register a new user through the UI');
        } else {
            console.log('✅ Found users in database:');
            users.forEach(user => {
                console.log(`   👤 Username: ${user.username}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   🏷️  Role: ${user.role}`);
                console.log(`   📅 Created: ${user.createdAt}`);
                console.log('');
            });
            console.log('🔐 Try logging in with any of these usernames and the password you set during registration');
        }

    } catch (error) {
        console.error('❌ Error checking users:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
