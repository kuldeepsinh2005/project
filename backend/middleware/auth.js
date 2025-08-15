import  ErrorResponse  from "../utils/errorResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import  User  from "../models/User.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // console.log("before verifying token",req.cookies);

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("after verifying token",token);
        // console.log(token);
        if (!token) {
            console.log("No token found1");
            throw new ErrorResponse(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            console.log("No token found");
            throw new ErrorResponse(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        next(new ErrorResponse(401, error?.message || "Invalid access token"));

    }
    
})