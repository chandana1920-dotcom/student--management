const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createStudentUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define user schema inline
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['admin', 'teacher', 'staff', 'student'], default: 'student' },
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Create a student user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('student123', salt);

        const studentUser = new User({
            username: 'student1',
            email: 'student1@example.com',
            password: hashedPassword,
            role: 'student'
        });
        
        await studentUser.save();
        
        console.log('✅ Student user created successfully!');
        console.log('   Username: student1');
        console.log('   Email: student1@example.com');
        console.log('   Password: student123');
        console.log('   Role: student');
        
        console.log('\n🎯 Now you can test:');
        console.log('   1. Login with email: student1@example.com');
        console.log('   2. Login with username: student1');
        console.log('   3. Try adding students as a student user');

    } catch (error) {
        if (error.code === 11000) {
            console.log('ℹ️  Student user already exists');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        await mongoose.disconnect();
    }
}

createStudentUser();
