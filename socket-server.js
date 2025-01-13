import express from "express"
import http from "http"
import {Server} from "socket.io"
import logger from "./utils/logger.js";

const app=express()

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.json());

const rooms = new Map(); 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    rooms.set(socket.id, conversationId); 
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("disconnect", () => {
    const conversationId = rooms.get(socket.id); 
    if (conversationId) {
      socket.leave(conversationId);
      rooms.delete(socket.id); 
    }
    console.log("User disconnected:", socket.id);
  });
});

app.post("/broadcast", (req, res) => {
    const { conversationId, sender, message } = req.body;

    io.to(conversationId).emit("receive_message", { sender, message });
    console.log(`Broadcasting message to conversation ${conversationId}: ${message}`);
  
    res.status(200).send("Message broadcasted");
  });

server.listen(4000, () => {
  logger.info(`Serving on http://localhost:4000`);
});
