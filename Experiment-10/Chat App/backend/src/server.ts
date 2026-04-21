import "./Utils/dotenv.js";
import express from "express";
import connectDB from "./Utils/db.js";
import cors from "cors";
import userRoutes from "./Routes/userRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(express.json());
app.use(cors());

/* Connect Database */
connectDB();

/* Routes */
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

/* Test Route */
app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user: any) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("ping_latency", (callback) => {
    if (typeof callback === "function") {
      callback();
    }
  });

  socket.off("setup", (userData) => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

/* Start Server */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});