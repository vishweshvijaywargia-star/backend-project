import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadToCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details form frontend
    //validation of user details
    //check if user already exists
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh tokens from response 
    //check for user response
    //return response to frontend 

    const { username, email, fullName, password } = req.body;
    console.log("User email received:", email);

    //validation
    if(fullName.trim() === "" || username.trim() === "" || email.trim() === "" || password.trim() === "") {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists
    const userExists = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }]
    })
    
    if(userExists) {
        throw new ApiError(409, "User already exists");
    }

    const avatarPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;
    
    if(!avatarPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadToCloudinary(avatarPath, "avatars");
    const coverImage = await uploadToCloudinary(coverImagePath, "coverImages");

    if(!avatar) {
        throw new ApiError(400, "Failed to upload avatar image");
    }

    if(!coverImage) {
        throw new ApiError(400, "Failed to upload cover image");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.secure_url,
        coverImage: coverImage.secure_url,
        username : username.toLowerCase(),
        email : email.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );

});

export { registerUser };