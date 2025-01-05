import { Channel } from "../models/channel.model.js";
import { Members } from "../models/member.model.js";
import { Workspace } from "../models/workspace.model.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

//To create a Channel and save the details about the channel with an avatar and create a member i.e. owner as soon as the channel is created & send response.
const createChannel = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { name, userId } = req.body;

    if (!workspaceId || !name || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newChannel = new Channel({
      name,
      members: [],
      workspaceId: workspaceId,
      owner: userId,
    });

    const saveChannel = await newChannel.save();

    const OwnerMember = new Members({
      userId: userId,
      workspaceId: workspaceId,
    });

    OwnerMember.channelId.push(saveChannel._id);
    await OwnerMember.save();

    saveChannel.members.push(OwnerMember._id);
    await saveChannel.save();

    const workspace=await Workspace.findById(workspaceId);
    workspace.channels.push(saveChannel._id);
    await workspace.save();

    return res.status(201).json({
      message: "Channel created successfully",
      channel: saveChannel,
      member: OwnerMember,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating channel", error });
  }
};

//To find all the Channels and populate the response with info about its members and owner and return it
const getAllChannels = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    const channels = await Channel.find({ workspaceId })
      .populate("members")
      .populate("owner");

    if (!channels || channels.length === 0) {
      return res.status(404).json({ message: "No channels could be found" });
    }

    return res.status(200).json({ channels });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error fetching channels", error });
  }
};

//To find the Channel using its unique ID and populate the response with the owner and members data and return the channel
const getChannelUsingId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    const channel = await Channel.findById(id)
      .populate("owner")
      .populate("members");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    return res.status(200).json({ channel });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ message: "Error fetching channel", error });
  }
};
// To update the channel info based on its unique id with the provided payload and return the update channel object.
const updateChannel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
      return res
        .status(400)
        .json({ message: "Channel ID and name are required" });
    }

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (name) {
      channel.name = name;
    }

    await channel.save();

    return res
      .status(200)
      .json({ message: "Channel updation successful", channel });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Error updating the channel", error });
  }
};

//To delete the Channel based on its unique id and return the response if channel is deleted successfully.
const deleteChannel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    const channel = await Channel.findByIdAndDelete(id);

    if (!channel) {
      return res.status(404).json({ message: "Channel was not found" });
    }

    await Members.deleteMany({ channelId: id });

    const { workspaceId } = channel;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.channels.pull(channel._id);

    await workspace.save();

    return res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Error while deleting channel", error });
  }
};

export {
  createChannel,
  getAllChannels,
  getChannelUsingId,
  updateChannel,
  deleteChannel,
};
