import express from "express";
import oauthRoutes from "./oauth.routes.js"
import userRoutes from "./user.routes.js"
import channelRoutes from "./channel.routes.js"
import memberRoutes from "./member.routes.js"
import conversationRoutes from "./conversation.routes.js"
import workspaceRoutes from "./workspace.routes.js"
import messageRoutes from "./message.routes.js"

const router=express.Router();

router.use('/',oauthRoutes)
router.use('/',userRoutes)
router.use('/',channelRoutes)
router.use('/',memberRoutes)
router.use('/',conversationRoutes)
router.use('/',workspaceRoutes)
router.use('/',messageRoutes)


export {oauthRoutes,userRoutes,memberRoutes,conversationRoutes,workspaceRoutes,channelRoutes,messageRoutes};