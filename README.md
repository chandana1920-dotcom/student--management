# Student Management System

A comprehensive student management system built with Node.js, Express.js, and MongoDB. This application provides a complete solution for managing student records with user authentication, CRUD operations, and advanced features.

## Features

### Authentication
- User registration and login
- Role-based access control (Admin, Teacher, Staff)
- Secure password hashing with bcrypt
- JWT token-based authentication
- Session management

### Student Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Advanced search functionality
- Filter by course and status
- Pagination for large datasets
- Student statistics and analytics

### User Interface
- Modern, responsive design
- Clean and intuitive dashboard
- Real-time data updates
- Mobile-friendly interface
- Beautiful gradient design with smooth animations

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-session** - Session management

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern features
- **JavaScript (ES6+)** - Client-side functionality
- **Font Awesome** - Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/student_management
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_key_here
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the MONGODB_URI with your connection string.

5. **Start the application**
   ```bash
   # For development
   npm run dev
   
   # For production
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Usage

### First Time Setup
1. Register a new user account
2. Log in with your credentials
3. Start adding and managing students

### Main Features

#### Dashboard
- View student statistics
- Monitor active, graduated, and suspended students
- Quick overview of system status

#### Student Management
- **Add Students**: Complete form with all student details
- **View Students**: Paginated table with search and filter options
- **Edit Students**: Update student information
- **Delete Students**: Remove student records with confirmation

#### Search and Filter
- Search by name, email, or student ID
- Filter by course and status
- Real-time search results

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Students
- `GET /api/students` - Get all students with pagination
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/stats/overview` - Get statistics

## Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (admin/teacher/staff),
  createdAt: Date
}
```

### Student Model
```javascript
{
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
  enrollmentDate: Date,
  status: String (Active/Inactive/Graduated/Suspended),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Session management
- Input validation and sanitization
- CORS protection
- Secure session cookies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For any issues or questions, please open an issue on the GitHub repository.

---

**Note**: Make sure to secure your JWT_SECRET and SESSION_SECRET in production environments.