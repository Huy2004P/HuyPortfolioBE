# Portfolio Backend API

This is the backend service for a full-stack portfolio application. It provides RESTful APIs for managing projects, blog posts, user authentication, profile information, and image uploads. It is built using Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: Secure login system using JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Projects Management**: CRUD operations for portfolio projects.
- **Blog Posts Management**: CRUD operations for blog posts.
- **Profile Management**: Manage site owner's profile details and avatar.
- **Media Upload**: Direct image upload integration with Cloudinary using Multer.
- **Database Integration**: MongoDB object modeling using Mongoose.

## Technologies Used

- **Node.js** & **Express.js**: Core server framework.
- **MongoDB** & **Mongoose**: Database and ORM.
- **JWT (jsonwebtoken)**: For secure authentication.
- **Bcryptjs**: For securely hashing passwords.
- **Cloudinary** & **Multer**: For image uploading and cloud storage.
- **CORS**: Cross-Origin Resource Sharing middleware.
- **Dotenv**: Environment variable management.

## Project Structure

```text
backend/
├── .env                  # Environment variables configuration
├── server.js             # Main application entry point
├── package.json          # Project metadata and dependencies
├── seed.js               # Database seeding script
├── middleware/           # Custom Express middlewares (e.g., auth verification)
├── models/               # Mongoose database schemas
│   ├── Post.js
│   ├── Profile.js
│   ├── Project.js
│   └── User.js
└── routes/               # Express API routes
    ├── authRoutes.js     # /api/auth
    ├── postRoutes.js     # /api/posts
    ├── profileRoutes.js  # /api/profile
    ├── projectRoutes.js  # /api/projects
    └── uploadRoutes.js   # /api/upload
```

## Setup & Installation

### 1. Prerequisites
- Node.js installed on your machine
- MongoDB instance running locally or via MongoDB Atlas
- Cloudinary account for image storage

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the backend directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Running the Server
To start the server in development or production mode:
```bash
npm run dev
# OR
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints Overview

- **Auth**: `POST /api/auth/login`, etc.
- **Projects**: `GET`, `POST`, `PUT`, `DELETE` at `/api/projects`
- **Posts**: `GET`, `POST`, `PUT`, `DELETE` at `/api/posts`
- **Profile**: `GET`, `PUT` at `/api/profile`
- **Upload**: `POST /api/upload`

Protected routes require an `Authorization` header containing a valid Bearer token.
