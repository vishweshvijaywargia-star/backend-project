import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }
    catch(error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // Validation of user details
    // Check if user already exists
    // Check for images, check for avatar
    // Upload them to Cloudinary
    // Create user object - create entry in DB
    // Remove password and refresh tokens from response
    // Check for user response
    // Return response to frontend

    const { username, email, fullName, password } = req.body;

    console.log("Request body:", req.body);
    console.log("User email received:", email);
    console.log("Files received:", req.files);

    // Validation
    if (
        !fullName?.trim() ||
        !username?.trim() ||
        !email?.trim() ||
        !password?.trim()
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const userExists = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ]
    });

    if (userExists) {
        throw new ApiError(409, "User already exists");
    }

    // Get image paths
    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    // Avatar is required
    if (!avatarPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Upload avatar
    const avatar = await uploadToCloudinary(avatarPath, "avatars");

    // Upload cover image only if provided
    let coverImage = null;

    if (coverImagePath) {
        coverImage = await uploadToCloudinary(
            coverImagePath,
            "coverImages"
        );
    }

    if (!avatar) {
        throw new ApiError(
            400,
            "Failed to upload avatar image"
        );
    }

    if (coverImagePath && !coverImage) {
        throw new ApiError(
            400,
            "Failed to upload cover image"
        );
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password
    });

    // Remove sensitive fields
    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User created successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res) => {
    //req.body -> data
    //username or email
    //check user exists
    //compare password
    //generate access token
    //generate refresh token
    //send cookie

    const {username, email, password} = req.body;

    if(!username || !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne( {
        $or: [
            {username},
            {email}]
    })

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            { user: loggedUser, accessToken, refreshToken },
            "User logged in successfully"
        )
    );

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { new: true });

    const options = {
        httpOnly: true,
        secure: true
    };
    
    return res.status(200)
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };