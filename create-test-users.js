const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define user schema
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['admin', 'teacher', 'staff', 'student'], default: 'student' },
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Create multiple test users
        const testUsers = [
            {
                username: 'john_student',
                email: 'john@student.com',
                password: 'student123',
                role: 'student'
            },
            {
                username: 'jane_student',
                email: 'jane@student.com',
                password: 'student123',
                role: 'student'
            },
            {
                username: 'mike_teacher',
                email: 'mike@teacher.com',
                password: 'teacher123',
                role: 'teacher'
            }
        ];

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { username: userData.username },
                    { email: userData.email }
                ]
            });

            if (!existingUser) {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                const user = new User({
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });
                
                await user.save();
                console.log(`✅ Created user: ${userData.username} (${userData.email}) - Role: ${userData.role}`);
            } else {
                console.log(`ℹ️  User already exists: ${userData.username}`);
            }
        }

        console.log('\n🎯 Test Users Created:');
        console.log('1. John Student: john@student.com / student123');
        console.log('2. Jane Student: jane@student.com / student123');
        console.log('3. Mike Teacher: mike@teacher.com / teacher123');
        console.log('4. Admin: admin@example.com / admin123');
        console.log('\n📝 Users can now login with their EMAIL addresses!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUsers();
