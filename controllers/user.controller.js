import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { Members } from "../models/member.model.js";
import { Channel } from "../models/channel.model.js";

//~ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");

    if (!users || users.length === 0) {
      return res.status(404).json({ msg: "No users found." });
    }

    return res
      .status(200)
      .json({ msg: "Users fetched successfully: ", data: users });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
};

//~ Get a user by Id
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json({ msg: "Enter the ID!" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    return res.status(200).json({ msg: "User found: ", data: user });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ msg: "Internal server error!" });
  }
});

//~ Update a user by Id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, fullName, password } = req.body;

  if (!id || id.trim() === "") {
    return res.status(400).json({ msg: "ID is required!" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    const updates = {};
    if (username) updates.username = username.toLowerCase();
    if (email) updates.email = email;
    if (fullName) updates.fullName = fullName;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      fields: "-password -refreshToken",
    });

    if (!updatedUser) {
      return res.status(500).json({ msg: "User update failed!" });
    }

    return res.status(200).json({ msg: "User updated: ", data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error!" });
  }
});

//~ Delete a user by Id
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return res.status(400).json({ msg: "Email is required!" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    return res.status(200).json({ msg: "User deleted:", data: deletedUser });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error!" });
  }
});

//~ Get all the channels a user is part of by its Id
const getUserChannels = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === "") {
      return res.send(400).json({ msg: "User ID is required!" });
    }

    const members = await Members.find({ userId }).populate({
      path: "channelId",
      select: "-members",
    });

    if (!members.length) {
      return res.status(404).json({ msg: "No channels found for this user!" });
    }

    const channels = members.map((member) => member.channelId);

    return res.status(200).json({ channels });
  } catch (error) {
    logger.error(error);
  }
});

export { getAllUsers, getUserById, updateUser, deleteUser, getUserChannels };
