import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

 const uploadFileToCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) {
            return null;
        }
        //upload file to cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File uploaded to Cloudinary:", result.secure_url);
        //delete the local file after uploading to cloudinary
        fs.unlinkSync(localFilePath);
        return result;
    }
    catch(error) {
        console.error("Error uploading file to Cloudinary:", error);
        fs.unlinkSync(localFilePath); //delete the local file
        return null;
    }
 }

 export default uploadFileToCloudinary;