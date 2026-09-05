import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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

export { registerUser };