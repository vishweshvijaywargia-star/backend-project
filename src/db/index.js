import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {

    try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;