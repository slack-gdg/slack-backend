import mongoose, { Schema } from "mongoose";

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "Members",
    }],
    description: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true,
    },
  },
  { timestamps: true }
);

export const Channel = mongoose.model("Channel", channelSchema);
