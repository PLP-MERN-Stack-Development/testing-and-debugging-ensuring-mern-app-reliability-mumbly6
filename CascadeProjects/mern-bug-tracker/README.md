# MERN Bug Tracker

A full-stack bug tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication (register, login, password reset)
- Create, read, update, and delete bugs
- Assign bugs to team members
- Track bug status and priority
- Add comments and attachments to bugs
- Filter and sort bugs
- Responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/PLP-MERN-Stack-Development/testing-and-debugging-ensuring-mern-app-reliability-mumbly6.git
   cd testing-and-debugging-ensuring-mern-app-reliability-mumbly6
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory with:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=30d
     JWT_COOKIE_EXPIRE=30
     NODE_ENV=development
     ```

5. Start the development servers:
   - In the `backend` directory:
     ```bash
     npm run dev
     ```
   - In the `frontend` directory:
     ```bash
     npm run dev
     ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report

### Frontend
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React, Redux, Material-UI, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Testing**: Jest, React Testing Library

## License

This project is licensed under the MIT License.
