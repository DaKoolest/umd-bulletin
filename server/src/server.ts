import "dotenv/config";
import express from "express";
import { clerkClient, requireAuth, getAuth } from "@clerk/express";
import morgan from "morgan";

const app = express();
const PORT = 3001;

app.use(morgan("dev"));

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get("/me", requireAuth(), async (req, res) => {
    // Use `getAuth()` to get the user's `userId`
    const { userId } = getAuth(req);

    // Use Clerk's JavaScript Backend SDK to get the user's User object
    const user = userId ? await clerkClient.users.getUser(userId) : undefined;

    return res.json({ user });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
