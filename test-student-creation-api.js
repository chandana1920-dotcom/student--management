const mongoose = require('mongoose');
require('dotenv').config();

async function testStudentCreationAPI() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define student schema
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

        const Student = mongoose.model('Student', studentSchema);

        // Test creating a student
        console.log('Testing student creation...');
        
        const testStudent = {
            firstName: 'Test',
            lastName: 'Student',
            email: 'test.student@example.com',
            studentId: 'STU999',
            dateOfBirth: new Date('2000-01-01'),
            gender: 'Male',
            phone: '1234567890',
            address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345'
            },
            course: 'Test Course',
            year: 1,
            gpa: 3.0,
            status: 'Active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [
                { studentId: testStudent.studentId },
                { email: testStudent.email }
            ]
        });

        if (existingStudent) {
            console.log('Student already exists, deleting it first...');
            await Student.deleteOne({ _id: existingStudent._id });
        }

        // Create new student
        const student = new Student(testStudent);
        await student.save();
        
        console.log('✅ Student created successfully!');
        console.log('   Name:', student.firstName, student.lastName);
        console.log('   ID:', student.studentId);
        console.log('   Email:', student.email);

        // Verify student was saved
        const savedStudent = await Student.findOne({ studentId: 'STU999' });
        if (savedStudent) {
            console.log('✅ Student verified in database');
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

testStudentCreationAPI();
