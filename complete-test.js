const mongoose = require('mongoose');
require('dotenv').config();

async function completeTest() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define schemas
        const userSchema = new mongoose.Schema({
            username: String,
            email: String,
            password: String,
            role: String,
            createdAt: Date
        });

        const studentSchema = new mongoose.Schema({
            firstName: String,
            lastName: String,
            email: String,
            studentId: String,
            dateOfBirth: Date,
            gender: String,
            phone: String,
            address: Object,
            course: String,
            year: Number,
            gpa: Number,
            status: String,
            createdAt: Date,
            updatedAt: Date
        });

        const User = mongoose.model('User', userSchema);
        const Student = mongoose.model('Student', studentSchema);

        // Check users
        const users = await User.find({}, '-password');
        console.log('\n👥 Available Users:');
        users.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
        });

        // Check students
        const students = await Student.find();
        console.log('\n🎓 Available Students:');
        students.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} (${student.studentId}) - ${student.course}`);
        });

        console.log('\n✅ System Status: READY');
        console.log('\n🎯 Test Instructions:');
        console.log('1. Go to http://localhost:3000');
        console.log('2. Login with any of the following:');
        console.log('   - Admin: username "admin", password "admin123"');
        console.log('   - Student: username "student1", password "student123"');
        console.log('   - Or use email: student1@example.com, password "student123"');
        console.log('3. Try adding a new student');
        console.log('4. Test search and filter features');
        console.log('5. Test editing and deleting students');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

completeTest();
