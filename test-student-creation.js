const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
require('dotenv').config();

async function testStudentCreation() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // First, let's add some test students directly to the database
        console.log('Adding test students...');
        
        const testStudents = [
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.johnson@example.com',
                studentId: 'STU001',
                dateOfBirth: new Date('2001-05-15'),
                gender: 'Female',
                phone: '+1234567890',
                address: {
                    street: '123 College Ave',
                    city: 'Boston',
                    state: 'MA',
                    zipCode: '02115'
                },
                course: 'Computer Science',
                year: 2,
                gpa: 3.8,
                status: 'Active'
            },
            {
                firstName: 'Bob',
                lastName: 'Smith',
                email: 'bob.smith@example.com',
                studentId: 'STU002',
                dateOfBirth: new Date('2000-08-22'),
                gender: 'Male',
                phone: '+1234567891',
                address: {
                    street: '456 University St',
                    city: 'Cambridge',
                    state: 'MA',
                    zipCode: '02138'
                },
                course: 'Engineering',
                year: 3,
                gpa: 3.5,
                status: 'Active'
            }
        ];

        for (const studentData of testStudents) {
            // Check if student already exists
            const existingStudent = await Student.findOne({
                $or: [
                    { studentId: studentData.studentId },
                    { email: studentData.email }
                ]
            });

            if (!existingStudent) {
                const student = new Student(studentData);
                await student.save();
                console.log(`✅ Created student: ${studentData.firstName} ${studentData.lastName} (${studentData.studentId})`);
            } else {
                console.log(`ℹ️  Student already exists: ${studentData.studentId}`);
            }
        }

        // Count total students
        const totalStudents = await Student.countDocuments();
        console.log(`\n📊 Total students in database: ${totalStudents}`);

        // Show all students
        const allStudents = await Student.find({}, '-__v');
        console.log('\n👥 All students:');
        allStudents.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} - ${student.studentId} - ${student.course}`);
        });

        console.log('\n🎉 Student creation test completed!');
        console.log('🌐 You can now login at http://localhost:3000 with:');
        console.log('   Username: admin');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testStudentCreation();
