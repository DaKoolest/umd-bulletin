import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

const router = express.Router();

router.post(
    "/api/webhooks",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        try {
            const evt = await verifyWebhook(req);

            const eventType = evt.type;
            const clerkId = evt.data.id;

            switch (eventType) {
                case "user.created":
                    const username = evt.data.username;

                    try {
                        await User.create({ clerkId, username });
                        console.log(
                            `User created and saved: ${username} (${clerkId})`
                        );
                    } catch (err) {
                        try {
                            await User.deleteMany({ clerkId });
                            console.log(`User deleted from DB: ${clerkId}`);
                        } catch (err) {
                            console.error("Error deleting user:", err);
                        }
                    }

                    break;
                case "user.deleted":
                    try {
                        const user = await User.findOneAndDelete({ clerkId });

                        if (user) {
                            Like.deleteMany({ authorId: user._id });
                            Post.deleteMany({ authorId: user._id });
                            Comment.deleteMany({ authorId: user._id });
                        }

                        console.log(`User deleted from DB: ${clerkId}`);
                    } catch (err) {
                        console.error("Error deleting user:", err);
                    }
                    break;
                default:
                    break;
            }

            return res.send("Webhook received");
        } catch (err) {
            console.error("Error verifying webhook:", err);
            return res.status(400).send("Error verifying webhook");
        }
    }
);

export default router;
