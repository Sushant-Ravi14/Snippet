# Snippet

Snippet is a modern social media application built with React Native (Expo) and a robust Node.js backend. It empowers users to share their moments, connect with others, and interact within a vibrant community.

## Features
- **User Authentication:** Secure Signup, Login, and session management using JWT.
- **Rich Post Creation:** Create posts with text, location tagging, and image uploads directly from your camera or photo gallery.
- **Image Optimization:** Automatic image compression and reliable Base64 storage in MongoDB.
- **Interactive Feed:** Scroll through a dynamic feed and engage with posts using Like, Dislike, and Comment functionality.
- **Notifications System:** Stay updated with notifications for new followers, likes, and comments.
- **Social Graph:** Follow and unfollow users, view detailed user profiles, and discover personalized content.
- **Search:** Search across posts and users to easily find communities and topics of interest.
- **Cross-Platform:** Seamlessly runs on both Android and iOS devices thanks to Expo.

## Tech Stack Used
### Frontend
- **React Native** & **Expo**
- **Expo Router** (for file-based routing)
- **Axios** (for API communication)
- **Expo Image Picker** & **Expo Image Manipulator**

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **JSON Web Tokens (JWT)** (for secure authentication)
- **Multer** (for handling form data and file uploads)

## Folder Structure
```
Snippet/
├── backend/
│   ├── config/         # Database and environment configurations
│   ├── controllers/    # Request handlers (auth, post, comment, user, etc.)
│   ├── middleware/     # Express middlewares (JWT auth, error handling, file upload)
│   ├── models/         # Mongoose database schemas
│   ├── routes/         # API endpoint definitions
│   ├── utils/          # Helper utilities
│   ├── seed.js         # Script to seed dummy data into the database
│   └── server.js       # Entry point for the backend server
└── frontend/
    ├── app/            # Expo Router application screens and tab layouts
    ├── assets/         # Static assets (images, fonts)
    ├── src/
    │   ├── api/        # Axios API client setup and requests
    │   ├── components/ # Reusable UI components (PostCard, CommentItem, etc.)
    │   ├── context/    # React Context providers (AuthContext)
    │   └── utils/      # Application configurations and helper functions
    └── app.json        # Expo app configuration
```

## Steps to Run it Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) installed and running locally (or a MongoDB Atlas URI)
- [Expo Go](https://expo.dev/client) app installed on your physical mobile device (or use an emulator)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Snippet/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (you can use `.env.example` as a reference) and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. (Optional) Run the seed script to populate the database with dummy data:
   ```bash
   node seed.js
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd Snippet/frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Update the API configuration if necessary:
   - Open `frontend/src/utils/config.js`.
   - Update `API_BASE_URL` and `UPLOADS_BASE_URL` to point to your local machine's IP address (e.g., `http://192.168.x.x:5000`) instead of the Render URL so your phone can communicate with your local backend.
4. Start the Expo development server:
   ```bash
   npx expo start
   ```

### 4. Run the App
- **Physical Device:** Open the Expo Go app on your phone and scan the QR code displayed in the terminal.
- **Emulator:** Press `a` in the terminal to run on an Android emulator, or `i` for an iOS simulator.
