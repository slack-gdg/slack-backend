import { Channel } from "../models/channel.model.js"
import { Members } from "../models/member.model.js"
import logger from "../utils/logger.js"
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


//To create a Channel and save the details about the channel with an avatar and create a member i.e. owner as soon as the channel is created & send response.
const createChannel = async (req, res, next) => {
    try {
        const { name, description, userId } = req.body
        const response = await axios.get('https://api.unsplash.com/photos/random', {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
            params: {
                count: 1,
            },
        });        
        const randomImage = response.url;
        const newChannel = new Channel({
            name,
            members: [],
            description,
            avatar: randomImage,
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
            data: response.data,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Error creating channel' });
    }
}

//To find all the Channels and populate the response with info about its members and owner and return it
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

//To find the Channel using its unique ID and populate the response with the owner and members data and return the channel
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
 // To update the channel info based on its unique id with the provided payload and return the update channel object.
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

//To delete the Channel based on its unique id and return the response if channel is deleted successfully.
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


export { createChannel, getAllChannels, getChannelUsingId, updateChannel, deleteChannel}