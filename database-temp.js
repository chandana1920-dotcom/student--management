// Temporary in-memory database for testing
let users = [];
let students = [];
let nextUserId = 1;
let nextStudentId = 1;

// User methods
exports.findUser = async (query) => {
    if (query.$or) {
        return users.find(user => 
            query.$or.some(condition => 
                (condition.username && user.username === condition.username) ||
                (condition.email && user.email === condition.email)
            )
        );
    }
    return users.find(user => 
        Object.entries(query).every(([key, value]) => user[key] === value)
    );
};

exports.createUser = async (userData) => {
    const user = {
        _id: nextUserId++,
        ...userData,
        createdAt: new Date()
    };
    users.push(user);
    return user;
};

// Student methods
exports.findStudents = async (query = {}, options = {}) => {
    let filteredStudents = students;
    
    // Apply search filter
    if (query.$or) {
        filteredStudents = students.filter(student =>
            query.$or.some(condition =>
                Object.entries(condition).some(([key, value]) =>
                    student[key] && student[key].toString().toLowerCase().includes(value.$regex.toLowerCase())
                )
            )
        );
    }
    
    // Apply exact filters
    Object.entries(query).forEach(([key, value]) => {
        if (key !== '$or' && value) {
            filteredStudents = filteredStudents.filter(student => student[key] === value);
        }
    });
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    
    const paginatedStudents = filteredStudents.slice(skip, skip + limit);
    
    return {
        students: paginatedStudents,
        pagination: {
            page,
            limit,
            total: filteredStudents.length,
            pages: Math.ceil(filteredStudents.length / limit)
        }
    };
};

exports.findStudentById = async (id) => {
    return students.find(student => student._id.toString() === id);
};

exports.createStudent = async (studentData) => {
    const student = {
        _id: nextStudentId++,
        ...studentData,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    students.push(student);
    return student;
};

exports.updateStudent = async (id, updateData) => {
    const index = students.findIndex(student => student._id.toString() === id);
    if (index !== -1) {
        students[index] = {
            ...students[index],
            ...updateData,
            updatedAt: new Date()
        };
        return students[index];
    }
    return null;
};

exports.deleteStudent = async (id) => {
    const index = students.findIndex(student => student._id.toString() === id);
    if (index !== -1) {
        const deleted = students.splice(index, 1)[0];
        return deleted;
    }
    return null;
};

exports.getStudentStats = async () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const graduatedStudents = students.filter(s => s.status === 'Graduated').length;
    const suspendedStudents = students.filter(s => s.status === 'Suspended').length;
    
    const courseDistribution = {};
    students.forEach(student => {
        courseDistribution[student.course] = (courseDistribution[student.course] || 0) + 1;
    });
    
    const yearDistribution = {};
    students.forEach(student => {
        yearDistribution[student.year] = (yearDistribution[student.year] || 0) + 1;
    });
    
    return {
        totalStudents,
        activeStudents,
        graduatedStudents,
        suspendedStudents,
        courseDistribution: Object.entries(courseDistribution).map(([course, count]) => ({ _id: course, count })),
        yearDistribution: Object.entries(yearDistribution).map(([year, count]) => ({ _id: parseInt(year), count }))
    };
};

// Add sample data for testing
const bcrypt = require('bcryptjs');

const initializeSampleData = async () => {
    if (users.length === 0) {
        // Create sample user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await exports.createUser({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });
        
        // Create sample students
        await exports.createStudent({
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
        });
        
        await exports.createStudent({
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
        });
    }
};

initializeSampleData();
