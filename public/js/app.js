// Global variables
let currentUser = null;
let currentPage = 1;
let totalPages = 1;

// DOM elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const editModal = document.getElementById('editModal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form
    registerForm.addEventListener('submit', handleRegister);
    
    // Add student form
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }
    
    // Edit student form
    const editStudentForm = document.getElementById('editStudentForm');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', handleEditStudent);
    }
}

// Tab switching
function showTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabBtns[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabBtns[1].classList.add('active');
    }
}

// Show login screen
function showLogin() {
    loginContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    
    if (currentUser) {
        document.getElementById('userDisplay').textContent = `${currentUser.username} (${currentUser.role})`;
    }
    
    loadDashboardStats();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showMessage('Login successful!', 'success');
            showDashboard();
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            showTab('login');
            registerForm.reset();
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        showLogin();
        showMessage('Logged out successfully', 'info');
    } catch (error) {
        showMessage('Error during logout', 'error');
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    switch(section) {
        case 'dashboard':
            document.getElementById('dashboardSection').style.display = 'block';
            document.querySelectorAll('.nav-link')[0].classList.add('active');
            loadDashboardStats();
            break;
        case 'students':
            document.getElementById('studentsSection').style.display = 'block';
            document.querySelectorAll('.nav-link')[1].classList.add('active');
            loadStudents();
            break;
        case 'addStudent':
            document.getElementById('addStudentSection').style.display = 'block';
            document.querySelectorAll('.nav-link')[2].classList.add('active');
            break;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/students/stats/overview');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('totalStudents').textContent = data.totalStudents;
            document.getElementById('activeStudents').textContent = data.activeStudents;
            document.getElementById('graduatedStudents').textContent = data.graduatedStudents;
            document.getElementById('suspendedStudents').textContent = data.suspendedStudents;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load students
async function loadStudents(page = 1, search = '', course = '', status = '') {
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            search: search,
            course: course,
            status: status
        });
        
        const response = await fetch(`/api/students?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayStudents(data.students);
            displayPagination(data.pagination);
            currentPage = data.pagination.page;
            totalPages = data.pagination.pages;
        }
    } catch (error) {
        showMessage('Error loading students', 'error');
    }
}

// Display students in table
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.year}</td>
            <td><span class="status-badge ${student.status.toLowerCase()}">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-edit" onclick="editStudent('${student._id}')">Edit</button>
                    <button class="btn-sm btn-delete" onclick="deleteStudent('${student._id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display pagination
function displayPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = pagination.page === 1;
    prevBtn.onclick = () => loadStudents(pagination.page - 1);
    paginationDiv.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === pagination.page ? 'active' : '';
        pageBtn.onclick = () => loadStudents(i);
        paginationDiv.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = pagination.page === pagination.pages;
    nextBtn.onclick = () => loadStudents(pagination.page + 1);
    paginationDiv.appendChild(nextBtn);
}

// Search students
function searchStudents() {
    const search = document.getElementById('searchInput').value;
    const course = document.getElementById('courseFilter').value;
    const status = document.getElementById('statusFilter').value;
    loadStudents(1, search, course, status);
}

// Filter students
function filterStudents() {
    searchStudents();
}

// Handle add student
async function handleAddStudent(e) {
    e.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('studentId').value;
    const email = document.getElementById('email').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    const course = document.getElementById('course').value;
    const yearSelect = document.getElementById('year');
    const gpa = document.getElementById('gpa').value;
    const address = document.getElementById('address').value;
    const status = document.getElementById('status').value;
    
    // Extract numeric year from select option
    let year = 1;
    if (yearSelect.value) {
        year = parseInt(yearSelect.value);
        if (isNaN(year)) {
            // If the select contains text like "4th Year", extract the number
            const match = yearSelect.value.match(/\d+/);
            year = match ? parseInt(match[0]) : 1;
        }
    }
    
    // Create proper address object
    let addressObj = {};
    if (address && address.trim()) {
        addressObj = {
            street: address,
            city: address,
            state: '',
            zipCode: ''
        };
    }
    
    const studentData = {
        firstName,
        lastName,
        studentId,
        email,
        dateOfBirth,
        gender,
        phone,
        course,
        year,
        gpa: parseFloat(gpa) || 0,
        address: addressObj,
        status
    };
    
    console.log('Sending student data:', studentData);
    
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Student added successfully!', 'success');
            e.target.reset();
            showSection('students');
        } else {
            showMessage(data.message || 'Error adding student', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Edit student
async function editStudent(studentId) {
    try {
        const response = await fetch(`/api/students/${studentId}`);
        const student = await response.json();
        
        if (response.ok) {
            populateEditForm(student);
            editModal.style.display = 'flex';
        } else {
            showMessage('Error loading student data', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Populate edit form
function populateEditForm(student) {
    const form = document.getElementById('editStudentForm');
    form.innerHTML = `
        <input type="hidden" id="editStudentId" value="${student._id}">
        
        <div class="form-row">
            <div class="form-group">
                <label for="editFirstName">First Name</label>
                <input type="text" id="editFirstName" value="${student.firstName}" required>
            </div>
            <div class="form-group">
                <label for="editLastName">Last Name</label>
                <input type="text" id="editLastName" value="${student.lastName}" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="editStudentId">Student ID</label>
                <input type="text" id="editStudentId" value="${student.studentId}" required>
            </div>
            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" value="${student.email}" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="editDateOfBirth">Date of Birth</label>
                <input type="date" id="editDateOfBirth" value="${new Date(student.dateOfBirth).toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="editGender">Gender</label>
                <select id="editGender" required>
                    <option value="Male" ${student.gender === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${student.gender === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${student.gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="editPhone">Phone</label>
                <input type="tel" id="editPhone" value="${student.phone}" required>
            </div>
            <div class="form-group">
                <label for="editCourse">Course</label>
                <input type="text" id="editCourse" value="${student.course}" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="editYear">Year</label>
                <select id="editYear" required>
                    <option value="1" ${student.year === 1 ? 'selected' : ''}>1st Year</option>
                    <option value="2" ${student.year === 2 ? 'selected' : ''}>2nd Year</option>
                    <option value="3" ${student.year === 3 ? 'selected' : ''}>3rd Year</option>
                    <option value="4" ${student.year === 4 ? 'selected' : ''}>4th Year</option>
                    <option value="5" ${student.year === 5 ? 'selected' : ''}>5th Year</option>
                    <option value="6" ${student.year === 6 ? 'selected' : ''}>6th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editGpa">GPA</label>
                <input type="number" id="editGpa" min="0" max="4" step="0.01" value="${student.gpa || 0}">
            </div>
        </div>
        
        <div class="form-group">
            <label for="editAddress">Address</label>
            <textarea id="editAddress" rows="3">${student.address || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label for="editStatus">Status</label>
            <select id="editStatus" required>
                <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                <option value="Graduated" ${student.status === 'Graduated' ? 'selected' : ''}>Graduated</option>
                <option value="Suspended" ${student.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
            </select>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn-primary">Update Student</button>
            <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
        </div>
    `;
}

// Handle edit student
async function handleEditStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('editStudentId').value;
    const studentData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        studentId: document.getElementById('editStudentId').value,
        email: document.getElementById('editEmail').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value,
        gender: document.getElementById('editGender').value,
        phone: document.getElementById('editPhone').value,
        course: document.getElementById('editCourse').value,
        year: parseInt(document.getElementById('editYear').value),
        gpa: parseFloat(document.getElementById('editGpa').value) || 0,
        address: document.getElementById('editAddress').value,
        status: document.getElementById('editStatus').value
    };
    
    try {
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Student updated successfully!', 'success');
            closeEditModal();
            loadStudents(currentPage);
        } else {
            showMessage(data.message || 'Error updating student', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Student deleted successfully!', 'success');
            loadStudents(currentPage);
        } else {
            showMessage(data.message || 'Error deleting student', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
}

// Show message
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === editModal) {
        closeEditModal();
    }
}
