import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { Members } from "../models/member.model.js";
import { Channel } from "../models/channel.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(
      "Something went wrong while generating refresh and access token",
      error
    );
  }
};
const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json({ message: "All Fields are required" });
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res
      .status(409)
      .json({ message: "User with email or username already exists" });
  }
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res
      .status(500)
      .json({ message: "Something went wrong while registering the user" });
  }

  return res.status(201).json({ message: "User registered successfully" });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;
  if (!username && !email && !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid user credentials" });
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ message: "User logged in successfully" });
});
const logoutUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged Out" });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "unauthorized request" });
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is expired or used" });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ message: "Access token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

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

const getUserChannels = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === "") {
      return res.send(400).json({ msg: "User ID is required!" });
    }

    const members = await Members.find({ userId })
      .populate({
        path: "channelId",
        select: "-members"
      })

    if (!members.length) {
      return res.status(404).json({ msg: "No channels found for this user!" });
    }

    const channels = members.map((member) => member.channelId);

    return res.status(200).json({ channels });
  } catch (error) {
    logger.error(error);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserChannels,
};