import "dotenv/config";
import express from "express";
import { clerkClient, requireAuth, getAuth } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";
import mongoose from "mongoose";
import morgan from "morgan";
import User from "./models/User.ts";
import Post from "./models/Post.ts";

const app = express();
app.use(express.json());
const PORT = 3001;

app.use(morgan("dev"));

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get("/get-personal-posts", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);

    try {
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            res.status(500).json({ message: "Server error" });
        }

        const authorId = user?._id;

        const posts = await Post.find({ authorId });
        res.status(200).json({
            posts: posts.map((p) => ({
                author: user?.username,
                title: p.title,
                body: p.body,
                likes: p.likes.length,
                pos: p.location,
                hasUserLiked: false,
                createdAt: p.createdAt,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/create-post", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);
    console.log(req);
    const { title, body, location } = req.body;

    try {
        const user = await User.findOne({ clerkId: userId });
        const authorId = user?._id;

        if (!(title || body || location || authorId)) {
            res.status(500).json({ message: "Server error" });
        }

        const post = new Post({
            authorId,
            title,
            body,
            location,
        });

        const savedPost = await post.save();
        res.status(201).json({ message: "Added sucessfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post(
    "/api/webhooks",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        try {
            const evt = await verifyWebhook(req);

            // Do something with payload
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
                        await User.deleteOne({ clerkId });
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

mongoose.connect(process.env.MONGO_URI ?? "").then(() => {
    console.log("Database is connected succesfully.");
    app.listen(PORT, () => {
        console.log(`Example app listening at http://localhost:${PORT}`);
    });
});
