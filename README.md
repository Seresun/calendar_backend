Calendar Backend

This package contains the backend API for the calendar application with tasks and holidays.
The server is built with Node.js, Express, and TypeScript, and task data is stored in MongoDB.

Features

CRUD operations for tasks by date (create, update text, delete, move between days).

Tasks are stored in MongoDB in a single tasks collection.

Endpoints for retrieving a list of holidays.

Simple health check endpoint (/health) to verify that the server is running.

CORS configuration for both local frontend development and the deployed frontend.

Requirements

Node.js 18+

Access to a MongoDB instance (local or cloud)

Installation
cd backend
npm install
Environment Setup

Create a .env file in the backend directory with the following values:

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db_name>
PORT=3001

In the code, there is also an allowedOrigins array in src/index.ts.
By default, it allows requests from:

http://localhost:5173

https://calendar-frontend-opal.vercel.app

You can add additional origins if you deploy the frontend elsewhere.

Running in Development Mode
cd backend
npm run dev

The server starts on the port specified in PORT (default is 3001).
When you make changes to the source code, ts-node-dev automatically restarts the server.

Build and Run in Production
npm run build
npm start

npm run build — compiles TypeScript into the dist/ folder.

npm start — runs the compiled JavaScript (dist/index.js).

Main Endpoints

GET /health — checks if the server is running.

GET /tasks and other /tasks/* routes — task management.

GET /holidays and other /holidays/* routes — holiday data.

You can find the exact route implementations in:

src/routes/tasksRoutes.ts

src/routes/holidaysRoutes.ts

Server Shutdown

The server handles SIGINT and SIGTERM signals gracefully.
When the process is stopped, it properly closes the HTTP server and the MongoDB connection before exiting.