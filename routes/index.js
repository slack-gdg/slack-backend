import express from "express";
import oauthRoutes from "./oauth.routes.js"
import userRoutes from "./user.routes.js"
import channelRoutes from "./channel.routes.js"
import memberRoutes from "./member.routes.js"
import conversationRoutes from "./conversation.routes.js"

const router=express.Router();
router.use('/',oauthRoutes)
router.use('/',userRoutes)
router.use('/',channelRoutes)
router.use('/',memberRoutes)
router.use('/',conversationRoutes)
export {oauthRoutes,userRoutes,channelRoutes,memberRoutes,conversationRoutes};