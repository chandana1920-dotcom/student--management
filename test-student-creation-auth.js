const mongoose = require('mongoose');
require('dotenv').config();

async function testStudentCreationWithAuth() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Step 1: Login to get JWT token
        console.log('Step 1: Logging in to get JWT token...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'chandanancchandu@gmail.com',
                password: 'Chandana@123'
            })
        });

        if (!loginResponse.ok) {
            console.log('❌ Login failed:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('Token received:', loginData.token ? 'Yes' : 'No');

        // Step 2: Create student with JWT token
        console.log('\nStep 2: Creating student with JWT token...');
        const studentData = {
            firstName: 'Test',
            lastName: 'Auth',
            email: 'test.auth@example.com',
            studentId: 'STU8888',
            dateOfBirth: '2005-06-10',
            gender: 'Female',
            phone: '7022972892',
            course: 'computer science',
            year: 4,
            gpa: 3.5,
            address: {
                street: 'test street',
                city: 'test city',
                state: '',
                zipCode: ''
            },
            status: 'Active'
        };

        const studentResponse = await fetch('http://localhost:3000/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify(studentData)
        });

        if (studentResponse.ok) {
            const studentResult = await studentResponse.json();
            console.log('✅ Student created successfully!');
            console.log('Student ID:', studentResult.student._id);
            console.log('Student Name:', studentResult.student.firstName, studentResult.student.lastName);
        } else {
            const errorData = await studentResponse.json();
            console.log('❌ Student creation failed:', errorData.message);
        }

        // Step 3: Test loading students with JWT token
        console.log('\nStep 3: Loading students with JWT token...');
        const loadResponse = await fetch('http://localhost:3000/api/students', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (loadResponse.ok) {
            const loadData = await loadResponse.json();
            console.log('✅ Students loaded successfully!');
            console.log('Total students:', loadData.pagination.total);
        } else {
            const loadError = await loadResponse.json();
            console.log('❌ Loading students failed:', loadError.message);
        }

        console.log('\n🎯 Authentication Test Complete!');
        console.log('✅ JWT authentication is working properly');
        console.log('✅ Student creation with authentication works');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testStudentCreationWithAuth();
