import {User} from "./models/user.model.js"
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        res.status(500).json({message:"Something went wrong while generating refresh and access token"})
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, username, password } = req.body
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
       res.status(400).json({message:"All Fields are required"})
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        res.status(409).json({message:"User with email or username already exists"})
    }
    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        res.status(500).json({message:"Something went wrong while registering the user"})
    }

    return res.status(201).json(
        {message:"User registered successfully"}
    )

})

const loginUser = asyncHandler(async (req, res, next) => {

    const { email, username, password } = req.body
    if (!username && !email) {
        res.status(500).json({message:"username or email is required"})
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        res.status(404).json({message:"User does not exist"})
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        res.status(401).json({message:"Invalid user credentials"})
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        {message:"User logged in successfully"}
    )
}
        )
const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({message: "User logged Out"})
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        res.status(401).json({message:"unauthorized request"})
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            res.status(401).json({message:"Invalid refresh token"})
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            res.status(401).json({message:"Refresh token is expired or used"})
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
               {message:"Access token refreshed"}
                )
    } catch (error) {
        res.status(401).json({message:"Invalid refresh token"})
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}