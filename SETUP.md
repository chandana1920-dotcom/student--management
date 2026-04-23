# Setup Guide for Student Management System

## Quick Setup Instructions

### 1. Install MongoDB
#### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and choose "Complete" setup
3. Install MongoDB Compass (optional GUI tool)
4. Start MongoDB service:
   ```bash
   # As Administrator
   net start MongoDB
   ```

#### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Verify MongoDB Installation
Open a new terminal and run:
```bash
mongosh
```
You should see the MongoDB shell prompt.

### 3. Start the Application
```bash
# Navigate to project directory
cd student-management

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

### 4. Access the Application
Open your browser and go to: `http://localhost:3000`

## Alternative: Use MongoDB Atlas (Cloud)

If you prefer not to install MongoDB locally:

1. **Create a free MongoDB Atlas account** at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. **Create a new cluster** (free tier is sufficient)
3. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update your .env file**:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster-url/student_management?retryWrites=true&w=majority
   ```
5. **Replace `<username>` and `<password>` with your actual database credentials**

## Troubleshooting

### MongoDB Connection Issues
- **Error: "ECONNREFUSED"**: MongoDB is not running. Start the MongoDB service.
- **Error: "Authentication failed"**: Check your MongoDB credentials in the connection string.
- **Error: "Database not found"**: The database will be created automatically when you first use the app.

### Port Already in Use
If port 3000 is already in use:
1. **Change the port in .env**:
   ```
   PORT=3001
   ```
2. **Or kill the process using port 3000**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

### Node.js Version Issues
Ensure you have Node.js v14 or higher:
```bash
node --version
```

## First Steps After Setup

1. **Register a new user account**
2. **Login with your credentials**
3. **Add your first student**
4. **Explore the dashboard and features**

## Development Mode

For development with auto-restart:
```bash
npm install -g nodemon
npm run dev
```

The server will automatically restart when you make changes to the code.

## Production Deployment

For production deployment, consider:
1. **Use environment variables** for all sensitive data
2. **Enable HTTPS** with SSL certificates
3. **Use a process manager** like PM2
4. **Set up proper logging**
5. **Configure firewall rules**
6. **Use MongoDB Atlas** for cloud database

## Need Help?

- Check the main README.md for detailed documentation
- Open an issue on GitHub for specific problems
- Review the API documentation in the README
