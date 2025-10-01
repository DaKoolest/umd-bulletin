import s3 from "./s3.js";
import Post from "../models/Post.js";

async function getPosts(user, args) {
    const posts = await Post.find(args);

    return (
        (await Promise.all(
            posts.map(async (p) => ({
                author: user.username,
                title: p.title,
                body: p.body,
                likes: 0,
                pos: p.location,
                hasUserLiked: false,
                createdAt: p.createdAt,
                canDelete: true,
                postId: p._id,
                imageUrl: p.imageName
                    ? await s3.getS3ImageUrl(p.imageName)
                    : undefined,
            }))
        )) ?? []
    );
}

export default getPosts;
