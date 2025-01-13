import {Message} from "../models/message.model.js"
import axios from "axios";

const broadcastMessage=async(req, res) => {
    const {sender, message } = req.body;
    try {

      const savedMessage = await Message.create({ content: message, memberId: sender });

      await axios.post("http://localhost:4000/broadcast", {
        sender,
        message,
      });
  
      res.status(200).send({ message: "Message broadcasted", savedMessage });
    } catch (error) {
      console.error("Error broadcasting message:", error);
      res.status(500).send({ error: "Failed to broadcast message" });
    }
  };
  
  export {broadcastMessage}