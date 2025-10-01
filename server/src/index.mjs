import "dotenv/config";
import mongoose from "mongoose";
import serverless from "serverless-http";
import app from "./app.js";

let isConnected = false;
const handleRequest = serverless(app);
export const handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!isConnected) {
        await mongoose.connect(process.env.MONGO_URI ?? "");
        isConnected = true;
    }

    return await handleRequest(event, context);
};
