import { Workspace } from "../models/workspace.model.js"
import { Members } from "../models/member.model.js"
import logger from "../utils/logger.js"
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


//To create a Workspace and save the details about the workspace with an avatar and create a member i.e. owner as soon as the workspace is created & send response.
const createWorkspace = async (req, res, next) => {
    try {
        const { name, description, userId } = req.body

        if (!name || !description || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const response = await axios.get('https://api.unsplash.com/photos/random', {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
            params: {
                count: 1,
            },
        });        
        const randomImage = response.url;

        const newWorkspace = new Workspace({
            name,
            members: [],
            channels: [],
            description,
            avatar: randomImage,
            owner: userId
        })

        const saveWorkspace = await newWorkspace.save()

        const OwnerMember = new Members({
            userId: userId,
            workspaceId: saveWorkspace._id
        })

        await OwnerMember.save();

        saveWorkspace.members.push(OwnerMember._id);
        await saveWorkspace.save();

        return res.status(201).json({
            message: 'Workspace created successfully',
            workspace: saveWorkspace,
            member: OwnerMember,
            data: response.data,
        });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Error creating workspace' });
    }
}

//To find all the Workspaces and populate the response with info about its members and owner and return it
const getAllWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspace.find().populate('members').populate('owner');

        if (!workspaces || workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces could be found" });
        }

        return res.status(200).json({ workspaces });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error fetching workspaces", error });
    }
};

//To find the Workspace using its unique ID and populate the response with the owner and members data and return the workspace
const getWorkspaceUsingId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Workspace ID is required" });
        }

        const workspace = await Workspace.findById(id).populate('owner').populate('members');
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        return res.status(200).json({ workspace });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error fetching workspace", error });
    }
};
 // To update the workspace info based on its unique id with the provided payload and return the update workspace object.
const updateWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Workspace ID is required" });
        }

        if(!name || !description){
            return res.status(400).json({message:"Name and description are required"})
        }
            

        const workspace = await Workspace.findById(id);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (name) {
            workspace.name = name;
        }

        if (description) {
            workspace.description = description;
        }

        await workspace.save();

        return res.status(200).json({ message: "Workspace updation successful", workspace });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error updating the workspace", error });
    }
};

//To delete the Workspace based on its unique id and return the response if workspace is deleted successfully.
const deleteWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Workspace ID is required" });
        }

        const workspace = await Workspace.findByIdAndDelete(id);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace was not found" });
        }

        await Members.deleteMany({ workspaceId: id });
        
        return res.status(200).json({ message: "Workspace deleted successfully" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error while deleting workspace", error });
    }
};


export { createWorkspace, getAllWorkspaces, getWorkspaceUsingId, updateWorkspace, deleteWorkspace}