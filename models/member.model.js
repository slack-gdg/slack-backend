import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema(
  {
    channelId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  { timestamps: true }
);

export const Members = mongoose.model("Members", memberSchema);
