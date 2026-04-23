const express = require('express');
const db = require('../database-temp');
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Get all students with pagination and search
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
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
            query.course = course;
        }
        
        if (status) {
            query.status = status;
        }

        const result = await db.findStudents(query, { page, limit });
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Get single student by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await db.findStudentById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Error fetching student' });
    }
});

// Create new student
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const studentData = req.body;
        
        // Check if student ID or email already exists
        const existingStudents = await db.findStudents({
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email }
            ]
        });
        
        if (existingStudents.students.length > 0) {
            return res.status(400).json({ 
                message: 'Student with this ID or email already exists' 
            });
        }
        
        const student = await db.createStudent(studentData);
        
        res.status(201).json({
            message: 'Student created successfully',
            student
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student' });
    }
});

// Update student
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const studentData = req.body;
        
        // Check if student ID or email already exists (excluding current student)
        const existingStudents = await db.findStudents({
            $or: [
                { studentId: studentData.studentId },
                { email: studentData.email }
            ]
        });
        
        const hasDuplicate = existingStudents.students.some(s => s._id.toString() !== req.params.id);
        
        if (hasDuplicate) {
            return res.status(400).json({ 
                message: 'Student with this ID or email already exists' 
            });
        }
        
        const student = await db.updateStudent(req.params.id, studentData);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
});

// Delete student
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await db.deleteStudent(req.params.id);
        
        if (!student) {
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
        const stats = await db.getStudentStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;
