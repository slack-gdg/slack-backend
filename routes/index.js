import express from "express";
import oauthRoutes from "./oauth.routes.js"
import userRoutes from "./user.routes.js"
import channelRoutes from "./channel.routes.js"

const router=express.Router();
router.use('/',oauthRoutes)
router.use('/',userRoutes)
router.use('/',channelRoutes)
export {oauthRoutes,userRoutes,channelRoutes};