import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export default async function requireAuthor(req, res, next) {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    const authorId = user?._id;

    if (!authorId) {
        return res
            .status(500)
            .json({ message: "Cannot find user in database" });
    } else {
        req.user = user;
        req.authorId = user._id;
        next();
    }
}
