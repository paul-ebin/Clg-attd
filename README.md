# Attendance Management System

This is a full-stack Attendance Management System built with React, Vite, Tailwind CSS, Node.js, Express, and Sequelize (MySQL).

## Prerequisites

- **Node.js**: You need to install Node.js (which includes npm) to run this project. [Download Node.js here](https://nodejs.org/).
- **MySQL Server**: You must have a MySQL server running locally.

## Setup Instructions

### 1. Database Setup
1. Log into your local MySQL instance (e.g., using MySQL Workbench or CLI).
2. Create a new database named `attendance_db`:
   ```sql
   CREATE DATABASE attendance_db;
   ```
3. Update the database credentials in `backend/.env` if your username is not `root` or if you have a password:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=attendance_db
   DB_PORT=3306
   ```

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```cmd
   cd backend
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the backend server (this will automatically create the tables in MySQL):
   ```cmd
   npm run dev
   ```
   *Note: If testing for the very first time, uncomment line 35 in `backend/src/server.js`: `await sequelize.sync({ alter: true });` and restart the server once to automatically generate the tables. Then comment it back out.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```cmd
   cd frontend
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the frontend Vite development server:
   ```cmd
   npm run dev
   ```

### 4. Admin Initialization
Since there are no users initially, you can create the first Admin account using a tool like Postman, or by manually inserting into the DB.
The API has a setup route for this:
- **POST** `http://localhost:5000/api/auth/setup-admin`
- **Body (JSON)**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

Once created, you can log in at `http://localhost:5173/login` with these credentials and start creating Departments, Classes, Teachers, and Students!
