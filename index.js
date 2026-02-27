import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer();

// setting cors for socket server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'https://main.d2z4mrmjwbw1fp.amplifyapp.com', // production - Amplify
        'https://hkp003.efx-design.com', // production - custom domain
        'http://localhost:3040', // local - testing for desktop
      ];
      // local - serveo tunnels (URL changes each time) - testing for mobile
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.serveousercontent.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// open a session
io.on('connection', (socket) => {
  // 1. user connects
  console.log(`User connected: ${socket.id}`);

  // 2. user join the session
  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined room: ${sessionId}`);
  });

  // 3. interactions sent to socket
  socket.on('tiltCommand', (data) => {
    // data = { sessionId: 'xyz', angle: 15 }
    io.to(data.sessionId).emit('updateDisplay', data);
  });

  // 4. user disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// server start on port (App Runner uses 8080, local uses 3041)
const PORT = process.env.PORT || 3041;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
