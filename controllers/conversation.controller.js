import Conversation from "../models/conversation.model.js";

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { conversationType, memberId, channelId } = req.body;

    if (!memberId || !conversationType) {
      return res
        .status(400)
        .json({ error: "Member ID and conversation type are required." });
    }

    if (conversationType === "Channel" && !channelId) {
      return res
        .status(400)
        .json({ error: "Channel ID is required for Channel conversations." });
    }

    const conversation = new Conversation({
      conversationType,
      memberId,
      channelId: conversationType === "Channel" ? channelId : null,
    });

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

    const conversation = await Conversation.findById(conversationId)
      .populate("memberId", "name")
      .populate("channelId", "name");

    if (!conversation.length) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch conversation.", details: err.message });
  }
};

// Get all conversations for a user
const getConversationsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({ error: "Member ID is required." });
    }

    const conversations = await Conversation.find({ memberId: memberId })
      .populate("memberId", "name")
      .populate("lastMessage", "content memberId createdAt")
      .populate("channelId", "name");

    if (!conversations.length) {
      return res.status(404).json({ error: "No conversations found." });
    }

    res.status(200).json(conversations);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch conversations.", details: err.message });
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

    if (!conversation.length) {
      return res.status(404).json({ error: "No conversations found." });
    }
    
    res.status(200).json(conversation);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch conversation.", details: err.message });
  }
};

export {
  createConversation,
  getConversationById,
  getConversationsByMember,
  getConversationByChannelId,
};
