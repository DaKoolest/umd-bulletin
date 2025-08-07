import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "authorId",
        required: true,
    },
    title: { type: String, required: true, maxlength: 25 },
    body: { type: String, required: true, maxlength: 100 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "authorId" }],
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
