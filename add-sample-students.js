const mongoose = require('mongoose');
require('dotenv').config();

async function addSampleStudents() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define student schema directly
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

        // Clear existing students
        await Student.deleteMany({});
        console.log('Cleared existing students');

        // Add sample students
        const sampleStudents = [
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
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date()
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
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Carol',
                lastName: 'Williams',
                email: 'carol.williams@example.com',
                studentId: 'STU003',
                dateOfBirth: new Date('2002-03-10'),
                gender: 'Female',
                phone: '+1234567892',
                address: {
                    street: '789 Campus Dr',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001'
                },
                course: 'Business',
                year: 1,
                gpa: 3.9,
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await Student.insertMany(sampleStudents);
        console.log('✅ Added 3 sample students');

        // Show the added students
        const students = await Student.find();
        console.log('\n👥 Students in database:');
        students.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} - ${student.studentId} - ${student.course}`);
        });

        console.log('\n🎉 Sample students added successfully!');
        console.log('🌐 Now you can:');
        console.log('   1. Login at http://localhost:3000');
        console.log('   2. Username: admin, Password: admin123');
        console.log('   3. View and manage students in the dashboard');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

addSampleStudents();
