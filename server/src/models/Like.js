import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "authorId",
        required: true,
    },
    likedObjId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "likedObjId",
        required: true,
    },
});

const Like = mongoose.model("Like", likeSchema);
export default Like;
