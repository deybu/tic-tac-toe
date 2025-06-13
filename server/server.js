// server.js (Paste this content into your server.js file in Codespaces)

// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Allows all origins for development (e.g., your local machine, or a Codespace preview)
    methods: ["GET", "POST"]
  }
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route to serve your index.html for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO Connection Handling (for real-time communication)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Example: Listen for a 'chat message' event from the client
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server listening for incoming connections
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // In Codespaces, you'll use the "Ports" tab to access this.
});