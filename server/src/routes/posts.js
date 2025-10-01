import { requireAuth } from "@clerk/express";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";

import { Router } from "express";
import multer from "multer";
import s3 from "../util/s3.js";
import getPosts from "../util/postService.js";
import requireAuthor from "../middleware/requireAuthor.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

router.get(
    "/get-personal-posts",
    requireAuth(),
    requireAuthor,
    async (req, res) => {
        const { user, authorId } = req;

        const processedPosts = await getPosts(user, { authorId });

        res.status(200).json({
            posts: processedPosts,
        });
    }
);

router.post(
    "/create-post",
    requireAuth(),
    requireAuthor,
    upload.single("image"),
    async (req, res) => {
        const { user, authorId } = req;
        const { title, body, location } = req.body;

        const post = new Post({
            authorId,
            title,
            body,
            location: JSON.parse(location),
            imageName: await s3.uploadAndProcessS3Image(req.file?.buffer),
        });

        const savedPost = await post.save();

        res.status(201).json({
            author: user.username,
            title: savedPost.title,
            body: savedPost.body,
            likes: 0,
            pos: savedPost.location,
            hasUserLiked: false,
            createdAt: savedPost.createdAt,
            canDelete: true,
            postId: savedPost._id,
            imageUrl: savedPost.imageName
                ? await s3.getS3ImageUrl(savedPost.imageName)
                : undefined,
        });
    }
);

router.post("/delete-post", requireAuth(), requireAuthor, async (req, res) => {
    const { authorId } = req;
    const { postId } = req.body;

    const deletedPost = await Post.findOneAndDelete({
        _id: postId,
        authorId: authorId,
    });

    if (deletedPost) {
        await Like.deleteMany({ likedObjId: postId });
        await Comment.deleteMany({ postId: postId });
        if (deletedPost.imageName) {
            await s3.deleteS3Image(deletedPost.imageName);
        }

        return res.status(200).json({ message: "Post deleted successfully" });
    } else {
        return res.status(403).json({ message: "Post not found" });
    }
});

export default router;
