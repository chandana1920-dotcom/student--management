const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check authentication using JWT
const isAuthenticated = (req, res, next) => {
    try {
        // Get token from Authorization header or session
        const token = req.headers.authorization?.split(' ')[1] || req.session.token;
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('User authenticated:', decoded.username, 'Role:', decoded.role);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Invalid token:', error.message);
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Get all students with pagination and search
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const search = req.query.search || '';
        const course = req.query.course || '';
        const status = req.query.status || '';
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (course) {
            query.course = { $regex: course, $options: 'i' };
        }
        
        if (status) {
            query.status = status;
        }

        // Use direct MongoDB connection
        const db = mongoose.connection.db;
        const students = await db.collection('students')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
            
        const total = await db.collection('students').countDocuments(query);
        
        res.json({
            students,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Create new student - FIXED VERSION
router.post('/', isAuthenticated, async (req, res) => {
    try {
        console.log('Student creation started - FIXED VERSION');
        console.log('Request body:', req.body);
        
        const studentData = req.body;
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'studentId', 'dateOfBirth', 'gender', 'phone', 'course', 'year', 'status'];
        const missingFields = requiredFields.filter(field => !studentData[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        console.log('Checking for existing student...');
        
        // Use direct MongoDB connection
        const db = mongoose.connection.db;
        
        // Check if student ID or email already exists
        const existingStudent = await db.collection('students').findOne({
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email }
            ]
        });
        
        if (existingStudent) {
            console.log('Student already exists:', existingStudent.studentId);
            return res.status(400).json({ 
                message: 'Student with this ID or email already exists' 
            });
        }
        
        console.log('Creating new student...');
        
        // Prepare student document with proper structure
        const studentDocument = {
            ...studentData,
            dateOfBirth: new Date(studentData.dateOfBirth),
            createdAt: new Date(),
            updatedAt: new Date(),
            enrollmentDate: new Date(),
            gpa: parseFloat(studentData.gpa) || 0,
            year: parseInt(studentData.year)
        };
        
        // Insert directly into MongoDB
        const result = await db.collection('students').insertOne(studentDocument);
        
        console.log('Student created successfully:', result.insertedId);
        
        // Return the created student
        const createdStudent = await db.collection('students').findOne({ _id: result.insertedId });
        
        res.status(201).json({
            message: 'Student created successfully',
            student: createdStudent
        });
    } catch (error) {
        console.error('Error creating student:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error creating student', error: error.message });
    }
});

// Get single student by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const student = await db.collection('students').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Error fetching student' });
    }
});

// Update student
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const studentData = req.body;
        const db = mongoose.connection.db;
        
        // Check if student ID or email already exists (excluding current student)
        const existingStudent = await db.collection('students').findOne({
            _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email }
            ]
        });
        
        if (existingStudent) {
            return res.status(400).json({ 
                message: 'Student with this ID or email already exists' 
            });
        }
        
        // Update student
        const updateData = {
            ...studentData,
            updatedAt: new Date(),
            dateOfBirth: new Date(studentData.dateOfBirth),
            gpa: parseFloat(studentData.gpa) || 0,
            year: parseInt(studentData.year)
        };
        
        const result = await db.collection('students').updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const updatedStudent = await db.collection('students').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        
        res.json({
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
});

// Delete student
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const result = await db.collection('students').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
});

// Get statistics
router.get('/stats/overview', isAuthenticated, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        const totalStudents = await db.collection('students').countDocuments();
        const activeStudents = await db.collection('students').countDocuments({ status: 'Active' });
        const graduatedStudents = await db.collection('students').countDocuments({ status: 'Graduated' });
        const suspendedStudents = await db.collection('students').countDocuments({ status: 'Suspended' });
        
        // Course distribution
        const coursePipeline = [
            { $group: { _id: '$course', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ];
        const courseDistribution = await db.collection('students').aggregate(coursePipeline).toArray();
        
        // Year distribution
        const yearPipeline = [
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ];
        const yearDistribution = await db.collection('students').aggregate(yearPipeline).toArray();
        
        res.json({
            totalStudents,
            activeStudents,
            graduatedStudents,
            suspendedStudents,
            courseDistribution,
            yearDistribution
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;
