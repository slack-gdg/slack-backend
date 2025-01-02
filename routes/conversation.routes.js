import express from "express";
import {
  createConversation,
  getConversationById,
  getConversationByChannelId,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", createConversation);

router.get("/:conversationId", getConversationById);

router.get("/channel/:channelId", getConversationByChannelId);

export default router;
