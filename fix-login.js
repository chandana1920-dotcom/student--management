const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the existing users collection to start fresh
        const db = mongoose.connection;
        await db.dropCollection('users').catch(() => console.log('Users collection does not exist, creating new one'));
        
        // Define proper user schema
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['admin', 'teacher', 'staff'], default: 'staff' },
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Create a proper admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });
        
        await adminUser.save();
        
        console.log('✅ Login fixed! Default admin user created:');
        console.log('   📧 Email: admin@example.com');
        console.log('   👤 Username: admin');
        console.log('   🔑 Password: admin123');
        console.log('');
        console.log('🌐 Go to http://localhost:3000 and login with these credentials');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

fixLogin();
