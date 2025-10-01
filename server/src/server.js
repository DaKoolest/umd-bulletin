import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

try {
    await mongoose.connect(process.env.MONGO_URI ?? "");
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT, () => {
        console.log(`Server running at http://localhost:${process.env.PORT}`);
    });
} catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
}
