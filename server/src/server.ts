import "dotenv/config";
import express from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";
import mongoose from "mongoose";
import morgan from "morgan";
import multer from "multer";
import crypto from "node:crypto";
import sharp from "sharp";
import User from "./models/User.ts";
import Post from "./models/Post.ts";
import Like from "./models/Like.ts";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKey = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: accessKey!,
        secretAccessKey: secretAccessKey!,
    },
});

//app.use(morgan("dev"));

async function getS3ImageUrl(imageName: string) {
    const getObjectParams = {
        Bucket: bucketName,
        Key: imageName,
    };
    const command = new GetObjectCommand(getObjectParams);
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

app.get("/get-personal-posts", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);

    try {
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            res.status(500).json({ message: "Server error" });
        }

        const authorId = user?._id;
        const posts = await Post.find({ authorId });

        const processedPosts: any[] = await Promise.all(
            posts.map(async (p) => ({
                author: user?.username,
                title: p.title,
                body: p.body,
                likes: 0,
                pos: p.location,
                hasUserLiked: false,
                createdAt: p.createdAt,
                canDelete: true,
                postId: p._id,
                imageUrl: p.imageName
                    ? await getS3ImageUrl(p.imageName)
                    : undefined,
            }))
        );

        res.status(200).json({
            posts: processedPosts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post(
    "/create-post",
    requireAuth(),
    upload.single("image"),
    async (req, res) => {
        const { userId } = getAuth(req);
        const { title, body, location } = req.body;

        try {
            const user = await User.findOne({ clerkId: userId });
            const authorId = user?._id;

            if (!(title && body && location && authorId)) {
                return res.status(500).json({ message: "Server error" });
            }

            let imgName: string | undefined = undefined;
            if (req.file) {
                const processedImage = await sharp(req.file.buffer)
                    .resize(400, 400, {
                        fit: "inside",
                        withoutEnlargement: true,
                    })
                    .jpeg({ quality: 65 })
                    .toBuffer();

                const imageKey = crypto.randomBytes(32).toString("hex");

                const command = new PutObjectCommand({
                    Bucket: bucketName,
                    Key: imageKey,
                    Body: processedImage,
                    ContentType: "image/jpeg",
                });

                await s3.send(command);
                imgName = imageKey;
            }

            const post = new Post({
                authorId,
                title,
                body,
                location: JSON.parse(location),
                imageName: imgName,
            });

            const savedPost = await post.save();
            res.status(201).json({
                author: user?.username,
                title: savedPost.title,
                body: savedPost.body,
                likes: 0,
                pos: savedPost.location,
                hasUserLiked: false,
                createdAt: savedPost.createdAt,
                canDelete: true,
                postId: savedPost._id,
                imageUrl: savedPost.imageName
                    ? await getS3ImageUrl(savedPost.imageName)
                    : undefined,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

app.post("/delete-post", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.body;

    try {
        const user = await User.findOne({ clerkId: userId });
        const authorId = user?._id;

        if (!postId) {
            return res.status(500).json({ message: "No post id..." });
        }

        await Like.deleteMany({ likedObjId: postId });

        const deletedPost = await Post.findOneAndDelete({
            _id: postId,
            authorId: authorId,
        });

        if (deletedPost) {
            return res
                .status(200)
                .json({ message: "Post deleted successfully" });
        } else {
            return res.status(403).json({ message: "Post not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/like", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);
    const { likedObjId, liked } = req.body;

    try {
        const user = await User.findOne({ clerkId: userId });
        const authorId = user?._id;

        if (!likedObjId || liked === undefined) {
            return res.status(500).json({ message: "Error with post body" });
        }

        await Like.findOneAndDelete({
            authorId,
            likedObjId,
        });

        if (liked) {
            const newLike = new Like({
                authorId,
                likedObjId,
            });

            await newLike.save();
        }

        return res.status(200).json({
            message: `${liked ? "Liked" : "Disliked"} message successfully!`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/get-likes", requireAuth(), async (req, res) => {
    const { userId } = getAuth(req);
    const { likedObjId } = req.body;

    try {
        const user = await User.findOne({ clerkId: userId });
        const authorId = user?._id;

        if (!likedObjId || !authorId) {
            return res.status(500).json({ message: "Error with post body" });
        }

        const likes = (await Like.find({ likedObjId })).length;
        const hasUserLiked = !!(await Like.exists({ likedObjId, authorId }));

        return res.status(200).json({ likes, hasUserLiked });
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

mongoose.connect(process.env.MONGO_URI ?? "").then(() => {
    console.log("Database is connected succesfully.");
    app.listen(process.env.PORT ?? 3000, () => {
        console.log(
            `Example app listening at http://localhost:${
                process.env.PORT ?? 3000
            }`
        );
    });
});
