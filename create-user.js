const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createDefaultUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define user schema inline to avoid model issues
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['admin', 'teacher', 'staff'], default: 'staff' },
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            // Create default admin user
            const adminUser = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            await adminUser.save();
            console.log('✅ Default admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   Email: admin@example.com');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        console.log('🎉 You can now login with these credentials!');
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createDefaultUser();
