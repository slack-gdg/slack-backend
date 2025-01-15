import { Server } from "socket.io";
import { createMessage } from "./message-service.js";
import logger from "../utils/logger.js";

export const SocketServiceInit = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });
  logger.info(`socket server is serving`);

  io.on("connection", (socket) => {
    console.log("New Connection connected :", socket.id);

    // event for joining conversation
    socket.on("join-conversation", (conversationId, callback) => {
      if (!conversationId) {
        callback({ valid: false, msg: "provide a conversation Id" });
      }

      socket.join(conversationId);
      callback({ valid: true, msg: "joined the room :", conversationId });
    });

    // event for sending messages
    socket.on("send-message", async (data) => {
      const { memberId, conversationId } = data;
      if (!memberId || !conversationId) {
        return;
      }
      const message = await createMessage(data);
      if (message) {
        io.to(data.conversationId).emit("receive-message", {
          message,
          msg: "received message",
        });
      }
    });

    // event for disconnecting
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
