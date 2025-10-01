import "dotenv/config";
import express from "express";
import morgan from "morgan";
import likesRouter from "./routes/likes.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import webhooksRouter from "./routes/webhooks.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());
//app.use(morgan("dev"));

app.use("/likes", likesRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use(webhooksRouter);

app.use(errorHandler);

export default app;
