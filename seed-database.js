const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
require('dotenv').config();

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            // Create default admin user
            const adminUser = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            });
            
            await adminUser.save();
            console.log('Default admin user created:');
            console.log('  Username: admin');
            console.log('  Password: admin123');
            console.log('  Email: admin@example.com');
        } else {
            console.log('Admin user already exists');
        }

        // Check if there are any students
        const studentCount = await Student.countDocuments();
        if (studentCount === 0) {
            // Create sample students
            const sampleStudents = [
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    studentId: 'STU001',
                    dateOfBirth: new Date('2000-01-15'),
                    gender: 'Male',
                    phone: '+1234567890',
                    address: {
                        street: '123 Main St',
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10001'
                    },
                    course: 'Computer Science',
                    year: 3,
                    gpa: 3.5,
                    status: 'Active'
                },
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    studentId: 'STU002',
                    dateOfBirth: new Date('2001-03-22'),
                    gender: 'Female',
                    phone: '+1234567891',
                    address: {
                        street: '456 Oak Ave',
                        city: 'Boston',
                        state: 'MA',
                        zipCode: '02108'
                    },
                    course: 'Engineering',
                    year: 2,
                    gpa: 3.8,
                    status: 'Active'
                }
            ];

            await Student.insertMany(sampleStudents);
            console.log('Sample students created');
        } else {
            console.log('Students already exist in database');
        }

        console.log('Database seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
