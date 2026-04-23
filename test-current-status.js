const mongoose = require('mongoose');
require('dotenv').config();

async function testCurrentStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Student = require('./models/Student');

        // Test student creation with current model
        const testStudent = {
            firstName: 'Test',
            lastName: 'Current',
            email: 'test.current@example.com',
            studentId: 'STU0001',
            dateOfBirth: '2005-06-10',
            gender: 'Female',
            phone: '7022972892',
            course: 'computer science',
            year: 3,
            gpa: 1.21,
            address: {
                street: 'banglore',
                city: 'banglore',
                state: '',
                zipCode: ''
            },
            status: 'Active'
        };

        console.log('Testing student creation...');
        
        // Remove existing test student
        await Student.deleteOne({ studentId: 'STU0001' });

        // Try to create student
        const student = new Student(testStudent);
        await student.save();
        
        console.log('✅ Student creation WORKS!');
        console.log('Student ID:', student._id);
        console.log('Name:', student.firstName, student.lastName);

    } catch (error) {
        console.error('❌ Student creation FAILED:', error.message);
        console.log('Error details:', error.stack);
    } finally {
        await mongoose.disconnect();
    }
}

testCurrentStatus();
