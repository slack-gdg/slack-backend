import { Workspace } from "../models/workspace.model.js"
import { Channel } from "../models/channel.model.js"
import { Members } from "../models/member.model.js"
import { User } from "../models/user.model.js"
import logger from "../utils/logger.js"

//To add member to a workspace and push the new member's id in the members array of Workspace schema and save the workspace.
const addMemberToWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.body;

        if(!workspaceId)
            return res.status(404).json({message:"Workspace Id is required"});

        if(!userId)
            return res.status(404).json({message:"User Id is required"});

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const newMember = new Members({
            userId: userId,
            channelId: [],
            workspaceId: workspaceId
        });
        await newMember.save();

        workspace.members.push(newMember._id);
        await workspace.save();

        return res.status(201).json({ message: "User has joined the workspace", member: newMember });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error adding member", error });
    }
};

//To find and return the complete workspace and user object about all the workspaces a user is part of.
const getWorkspaceMembers = async (req, res, next) => {
    const { userId } = req.params;

    if(!userId)
        return res.status(404).json({message:"User Id is required"});
    try {

        const members = await Members.find({ userId }).populate('workspaceId');

        if (!members || members.length === 0) {
            return res.status(404).json({ message: 'This user is not part of any Workspace' });
        }

        const response = await Promise.all(members.map(async (member) => {

            const workspace = await Workspace.findById(member.workspaceId).populate('owner');

            const user = await User.findById(member.userId);

            return {
                workspace: workspace,
                user: user,
            };
        }));

        return res
            .status(200)
            .json({
                message: 'Workspace members fetched successfully',
                data: response,
            });
    } catch (error) {
        logger.error(error.message)
        return res.status(500).json({ message: 'Error fetching workspace members' });
    }
};

//To delete a member from a workspace using both their respective unique IDs and return the response
const deleteMemberFromWorkspace = async (req, res, next) => {
    try {
        const { workspaceId, memberId } = req.params;

        if(!workspaceId || !memberId)
            return res.status(404).jsom({message:"Both workspace Id and User Id are required"})

        const member = await Members.findById(memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const { userId } = member; 
        await Members.findOneAndDelete({ workspaceId, userId});
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        workspace.members.pull(member._id);
        await workspace.save();

        const channels = await Channel.find({ workspaceId });

        for (const channel of channels) {
            channel.members.pull(member._id);
            await channel.save();
        }

        return res.status(200).json({ message: "Member has been removed from the workspace" });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: "Error removing member", error });
    }
};
export {addMemberToWorkspace,getWorkspaceMembers,deleteMemberFromWorkspace}