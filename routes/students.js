const express = require('express');
const Student = require('../models/Student');
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

        const students = await Student.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await Student.countDocuments(query);
        
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

// Get single student by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
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
        const existingStudent = await Student.findOne({
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
        
        const student = new Student(studentData);
        await student.save();
        
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
        const existingStudent = await Student.findOne({
            _id: { $ne: req.params.id },
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
        
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            studentData,
            { new: true, runValidators: true }
        );
        
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
        const student = await Student.findByIdAndDelete(req.params.id);
        
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
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ status: 'Active' });
        const graduatedStudents = await Student.countDocuments({ status: 'Graduated' });
        const suspendedStudents = await Student.countDocuments({ status: 'Suspended' });
        
        // Course distribution
        const courseDistribution = await Student.aggregate([
            { $group: { _id: '$course', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Year distribution
        const yearDistribution = await Student.aggregate([
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
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
