import express from "express";
import oauthRoutes from "./oauth.routes.js"
import userRoutes from "./user.routes.js"

const router=express.Router();
router.use('/',oauthRoutes)
router.use('/',userRoutes)
export {oauthRoutes,userRoutes};