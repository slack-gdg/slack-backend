import { Message } from "../models/message.model.js";

export const createMessage = async (data) => {
  try {
    const savedMessage = await Message.create(data);
    return savedMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    return null;
  }
};
