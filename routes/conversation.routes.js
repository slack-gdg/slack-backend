import express from "express";
import {
  createConversation,
  getConversationById,
  getConversationsByMember,
  getConversationByChannelId,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", createConversation);

router.get("/:conversationId", getConversationById);

router.get("/member/:memberId", getConversationsByMember);

router.get("/channel/:channelId", getConversationByChannelId);

export default router;
