// server/index.js
import http from "http";
import { Server } from "socket.io";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    // Allow Next.js (port 3000) and your local IP
    origin: ["http://localhost:3000", "http://192.168.1.60:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a phone or monitor joins a specific room
  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined room: ${sessionId}`);
  });

  // When the phone sends tilt data, broadcast it to everyone in that room
  socket.on("tiltCommand", (data) => {
    // data = { sessionId: 'xyz', angle: 15 }
    io.to(data.sessionId).emit("updateDisplay", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Socket.IO Server running on port ${PORT}`);
});
