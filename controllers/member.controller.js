import { Channel } from "../models/channel.model.js"
import { Members } from "../models/member.model.js"
import { User } from "../models/user.model.js"
import logger from "../utils/logger.js"
import mongoose from "mongoose"

//To add member to a channel and push the new member's id in the members array of Channel schema and save the channel.
const addMemberToChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        const newMember = new Members({
            userId: userId,
            channelId: channelId
        });
        await newMember.save();
        channel.members.push(newMember._id);
        await channel.save();
        return res.status(201).json({ message: "User has joined the channel", member: newMember });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error adding member", error });
    }
};

//To find and return the complete channel and user object about all the channels a user is part of.
const getChannelMembers = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const members = await Members.find({ userId }).populate('channelId');

        if (!members || members.length === 0) {
            return res.status(404).json({ message: 'This user is not part of any Channel' });
        }
        const response = await Promise.all(members.map(async (member) => {
            const channel = await Channel.findById(member.channelId).populate('owner');
            const user = await User.findById(member.userId);
            return {
                channel: channel,
                user: user,
            };
        }));

        return res
            .status(200)
            .json({
                message: 'Channel members fetched successfully',
                data: response,
            });
    } catch (error) {
        logger.error(error.message)
        return res.status(500).json({ message: 'Error fetching channel members' });
    }
};

//To delete a member from a channel using both their respective unique IDs and return the response
const deleteMemberFromChannel = async (req, res, next) => {
    try {
        const { channelId, memberId } = req.params;
        const member = await Members.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        const { userId } = member; 
    await Members.findOneAndDelete({ channelId, userId});
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        channel.members.pull(member._id);
        await channel.save();
        return res.status(200).json({ message: "Member has been removed from the channel" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error removing member", error });
    }
};
export {addMemberToChannel,getChannelMembers,deleteMemberFromChannel}