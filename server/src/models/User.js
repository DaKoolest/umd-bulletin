import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

export default User;
