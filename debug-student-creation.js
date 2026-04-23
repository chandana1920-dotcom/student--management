const mongoose = require('mongoose');
require('dotenv').config();

async function debugStudentCreation() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Use the actual Student model
        const Student = require('./models/Student');

        // Test with the exact data from the screenshot
        const studentData = {
            firstName: 'Test',
            lastName: 'Student',
            email: 'test.student@example.com',
            studentId: 'STU888',
            dateOfBirth: '10-06-2005', // This might be the issue - date format
            gender: 'Female',
            phone: '7022972892',
            address: 'banglore', // This might be the issue - should be object
            course: 'computer science',
            year: '4th Year', // This might be the issue - should be number
            gpa: 0.3,
            status: 'Active'
        };

        console.log('Testing student creation with form data...');
        console.log('Student data:', studentData);

        try {
            const student = new Student(studentData);
            await student.save();
            console.log('✅ Student created successfully!');
        } catch (error) {
            console.log('❌ Error creating student:', error.message);
            console.log('Validation errors:', error.errors);
        }

        // Test with corrected data
        console.log('\nTesting with corrected data...');
        const correctedData = {
            firstName: 'Test',
            lastName: 'Student',
            email: 'test.corrected@example.com',
            studentId: 'STU889',
            dateOfBirth: new Date('2005-06-10'), // Proper Date object
            gender: 'Female',
            phone: '7022972892',
            address: {
                street: 'banglore',
                city: 'banglore',
                state: 'KA',
                zipCode: '560001'
            }, // Proper address object
            course: 'computer science',
            year: 4, // Proper number
            gpa: 0.3,
            status: 'Active'
        };

        try {
            const student = new Student(correctedData);
            await student.save();
            console.log('✅ Corrected student created successfully!');
        } catch (error) {
            console.log('❌ Error with corrected data:', error.message);
            console.log('Validation errors:', error.errors);
        }

    } catch (error) {
        console.error('❌ Connection error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

debugStudentCreation();
