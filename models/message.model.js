import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    attachment: [
      {
        type: String,
      },
    ],
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
