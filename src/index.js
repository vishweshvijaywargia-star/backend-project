import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({
    path : './.env'
});

connectDB();

// app.get("/", (req, res) => {
//     res.send("API is running...");
// });

// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port ${process.env.PORT}`);
// })


// const app = express();
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

//         app.on("error", (err) => {
//             console.log(err);
//         }) 

//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })

//     }
//     catch (error) {
//         console.log(error);
//     }
// })()