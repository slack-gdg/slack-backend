import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema(
  {
    memberId: {
      type: String,
    },
    channelId: {
      type: Array,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Members = mongoose.model("Members", memberSchema);
