const mongoose = require('mongoose');
require('dotenv').config();

async function testFinalCreation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Student = require('./models/Student');

        // Test with the exact data format that should now work
        const studentData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            studentId: 'STU9999',
            dateOfBirth: '2005-06-10',
            gender: 'Female',
            phone: '7022972892',
            course: 'computer science',
            year: 4,
            gpa: 0.3,
            address: {
                street: 'banglore',
                city: 'banglore',
                state: 'KA',
                zipCode: '560001'
            },
            status: 'Active'
        };

        console.log('Testing final student creation...');
        console.log('Data:', studentData);

        // Remove existing test student if any
        await Student.deleteOne({ studentId: 'STU9999' });

        // Create new student
        const student = new Student(studentData);
        await student.save();
        
        console.log('✅ Student created successfully!');
        console.log('ID:', student._id);
        console.log('Name:', student.firstName, student.lastName);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.errors) {
            console.log('Validation errors:', error.errors);
        }
    } finally {
        await mongoose.disconnect();
    }
}

testFinalCreation();
