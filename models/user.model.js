import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      //required: [true, "Password is required!"],
      required: false
    },
    googleId: {
       type: String,
        required: false
    },
  },

  { timestamps: true }
);
userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next(); 
  this.password=await bcrypt.hash(this.password,10)
  next()
})
userSchema.methods.isPasswordCorrect=async function(password) {
 return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
return  jwt.sign(
      {
          _id:this._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn:process.env.ACCESS_TOKEN_EXPIRY
      }
)
}
userSchema.methods.generateRefreshToken=function(){
  return  jwt.sign(
      {
          _id:this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
)
}
export const User = mongoose.model("User", userSchema);
