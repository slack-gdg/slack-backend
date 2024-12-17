import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const validateUser=asyncHandler(async(req, res, next)=>{
  const { username, password } = req.body;

  if (!username && !password) {
    return res.status(400).json({ error: 'Username and password are required for JWT authentication' });
  }
  next();
})

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {      
      
        const token=req.cookies?.accessToken
        if(!token){
            res.status(401).json({message:"Unauthorized request"})
        }
      const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
      if(!user){
        res.status(401).json({message:"Invalid Access Token"})
      }
      req.user=user;
      next()
    } catch (error) {
        res.status(401).json({message:"Invalid access token"})
    }
})