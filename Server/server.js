import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./utils/Database.js";
import socketHandler from "./socket.js";
import { upload } from "./utils/Cloudinary.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Delegate socket logic to socket.js
socketHandler(io);

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  // console.log("file uploads: ", req.files);

  const files = req.files.map((file) => file.path);
  
  res.json(files);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));