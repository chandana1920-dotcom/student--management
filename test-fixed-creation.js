const mongoose = require('mongoose');
require('dotenv').config();

async function testFixedCreation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test the exact data that would come from the frontend
        const studentData = {
            firstName: 'Test',
            lastName: 'Fixed',
            email: 'test.fixed@example.com',
            studentId: 'STU9999',
            dateOfBirth: '2005-06-10',
            gender: 'Female',
            phone: '7022972892',
            course: 'computer science',
            year: 4,
            gpa: 2.16,
            address: {
                street: 'bang',
                city: 'bang',
                state: '',
                zipCode: ''
            },
            status: 'Active'
        };

        console.log('Testing FIXED student creation...');
        console.log('Data:', studentData);

        // Use direct MongoDB connection like the fixed routes
        const db = mongoose.connection.db;
        
        // Remove existing test student if any
        await db.collection('students').deleteOne({ studentId: 'STU9999' });

        // Insert the student directly
        const result = await db.collection('students').insertOne({
            ...studentData,
            dateOfBirth: new Date(studentData.dateOfBirth),
            createdAt: new Date(),
            updatedAt: new Date(),
            enrollmentDate: new Date(),
            gpa: parseFloat(studentData.gpa) || 0,
            year: parseInt(studentData.year)
        });
        
        console.log('✅ Student created successfully!');
        console.log('ID:', result.insertedId);
        
        // Verify the student was saved
        const savedStudent = await db.collection('students').findOne({ studentId: 'STU9999' });
        if (savedStudent) {
            console.log('✅ Student verified in database');
            console.log('Name:', savedStudent.firstName, savedStudent.lastName);
            console.log('Email:', savedStudent.email);
            console.log('Year:', savedStudent.year);
        } else {
            console.log('❌ Student not found in database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
    }
}

testFixedCreation();
