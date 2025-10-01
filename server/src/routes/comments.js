import { Router } from "express";
import { requireAuth } from "@clerk/express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import requireAuthor from "../middleware/requireAuthor.js";

const router = Router();

router.post("/add-comment", requireAuth(), requireAuthor, async (req, res) => {
    const { authorId, user } = req;
    const { postId, message } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
        authorId,
        username: user.username,
        postId,
        message,
    });

    const savedComment = await comment.save();

    res.status(201).json({
        commentId: savedComment._id,
        username: savedComment.username,
        postId: savedComment.postId,
        message: savedComment.message,
        createdAt: savedComment.createdAt,
        isAuthor: savedComment.authorId.equals(authorId),
    });
});

router.get(
    "/get-comments/:postId",
    requireAuth(),
    requireAuthor,
    async (req, res) => {
        const { authorId } = req;
        const { postId } = req.params;

        const comments = await Comment.find({ postId }).sort({ createdAt: 1 });

        res.status(200).json(
            comments.map((c) => ({
                commentId: c._id,
                username: c.username,
                postId: c.postId,
                message: c.message,
                createdAt: c.createdAt,
                isAuthor: c.authorId.equals(authorId),
            }))
        );
    }
);

router.post(
    "/delete-comment",
    requireAuth(),
    requireAuthor,
    async (req, res) => {
        const { authorId } = req;
        const { commentId } = req.body;

        const deletedComment = await Comment.findOneAndDelete({
            _id: commentId,
            authorId,
        });

        if (!deletedComment) {
            return res
                .status(403)
                .json({ message: "Comment not found or unauthorized" });
        }

        res.status(200).json({ message: "Comment deleted successfully" });
    }
);

export default router;
