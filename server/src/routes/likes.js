import { requireAuth } from "@clerk/express";
import Like from "../models/Like.js";

import { Router } from "express";
import requireAuthor from "../middleware/requireAuthor.js";

const router = Router();

router.post("/like", requireAuth(), requireAuthor, async (req, res) => {
    const { authorId } = req;
    const { likedObjId, liked } = req.body;

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
        message: `${liked ? "Liked" : "Disliked"} successfully!`,
    });
});

router.post("/get-likes", requireAuth(), requireAuthor, async (req, res) => {
    const { authorId } = req;
    const { likedObjId } = req.body;

    const likes = (await Like.find({ likedObjId })).length;
    const hasUserLiked = (await Like.exists({ likedObjId, authorId }))
        ? true
        : false;

    return res.status(200).json({ likes, hasUserLiked });
});

export default router;
