import { Channel } from "../models/channel.model.js"
import { Members } from "../models/member.model.js"
import { User } from "../models/user.model.js"
import logger from "../utils/logger.js"

const createChannel = async (req, res, next) => {
    try {
        const { name, description, userId } = req.body
        const newChannel = new Channel({
            name,
            members: [],
            description,
            avatar: '',
            owner: userId
        })
        const saveChannel = await newChannel.save()
        const OwnerMember = new Members({
            userId: userId,
            channelId: saveChannel._id
        })
        await OwnerMember.save();
        saveChannel.members.push(OwnerMember._id);
        await saveChannel.save();
        return res.status(201).json({
            message: 'Channel created successfully',
            channel: saveChannel,
            member: OwnerMember,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Error creating channel' });
    }
}
const getAllChannels = async (req, res, next) => {
    try {
        const channels = await Channel.find().populate('members').populate('owner');
        if (!channels || channels.length === 0) {
            return res.status(404).json({ message: "No channels could be found" });
        }
        return res.status(200).json({ channels });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error fetching channels", error });
    }
};

const getChannelUsingId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const channel = await Channel.findById(id).populate('owner').populate('members');
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        return res.status(200).json({ channel });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error fetching channel", error });
    }
};
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
}
const updateChannel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const channel = await Channel.findById(id);
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" });
        }
        if (name) {
            channel.name = name;
        }
        if (description) {
            channel.description = description;
        }
        await channel.save();
        return res.status(200).json({ message: "Channel updation successful", channel });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error updating the channel", error });
    }
};
const deleteChannel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const channel = await Channel.findByIdAndDelete(id);
        if (!channel) {
            return res.status(404).json({ message: "Channel was not found" });
        }
        await Members.deleteMany({ channelId: id });
        return res.status(200).json({ message: "Channel deleted successfully" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error while deleting channel", error });
    }
};
const deleteMemberFromChannel = async (req, res, next) => {
    try {
        const { channelId, memberId } = req.params;
        const member = await Members.findOneAndDelete({ channelId, userId: memberId });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        const channel = await Channel.findById(channelId);
        channel.members.pull(member._id);
        await channel.save();
        return res.status(200).json({ message: "Member has been removed from the channel" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error removing member", error });
    }
};


export { createChannel, getChannelMembers, getAllChannels, getChannelUsingId, addMemberToChannel, updateChannel, deleteChannel, deleteMemberFromChannel }