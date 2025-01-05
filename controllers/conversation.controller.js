import { Conversation } from "../models/conversation.model.js";

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { conversationType, participants, channelId } = req.body;

    if (!conversationType) {
      return res.status(400).json({ error: "Conversation type is required." });
    }

    if (conversationType === "Channel" && !channelId) {
      return res
        .status(400)
        .json({ error: "Channel ID is required for Channel conversations." });
    }

    if (
      conversationType === "DM" &&
      (!participants || participants.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "Participants are required for DM conversations." });
    }

    let conversation = {};
    if (conversationType === "Channel") {
      conversation = new Conversation({
        conversationType,
        participants: [],
        channelId: channelId,
      });
    } else {
      conversation = new Conversation({
        conversationType,
        participants,
        channelId: null,
      });
    }

    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create conversation.", details: err.message });
  }
};

//Get Conversation By Id
const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required." });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch conversation.", details: err.message });
  }
};

//Get Conversation By Channel Id
const getConversationByChannelId = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is required." });
    }

    const conversation = await Conversation.find({ channelId: channelId });

    if (conversation.length === 0) {
      return res.status(404).json({ error: "No conversations found." });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch conversation.", details: err.message });
  }
};

export { createConversation, getConversationById, getConversationByChannelId };
