import mongoose, { Schema } from "mongoose";

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: Array,
    },
    desc: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Channel = mongoose.model("Channel", channelSchema);
