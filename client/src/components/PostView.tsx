import { Box, Typography, IconButton, Button } from "@mui/material";
import type { Post } from "./PostModal";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { usePostLikes } from "../hooks/usePostLikes";
import { useDeletePost } from "../hooks/useDeletePost";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

export type PostViewProps = {
    userPost: Post;
    onClose: () => void;
};

function PostView({ userPost, onClose }: PostViewProps) {
    const { likesQuery, toggleLike } = usePostLikes(userPost.postId);
    const { deletePost } = useDeletePost(onClose);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                padding: 2,
            }}
        >
            <Typography variant="h6">{userPost.title}</Typography>
            <Typography sx={{ mt: -1 }} variant="caption">
                {userPost.author}
            </Typography>

            <Typography
                sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                }}
            >
                {userPost.body}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={toggleLike}>
                    <ThumbUpIcon
                        color={
                            likesQuery.data?.hasUserLiked ? "primary" : "action"
                        }
                    />
                </IconButton>
                <Typography>{likesQuery.data?.likes ?? 0}</Typography>
            </Box>
            {userPost.imageUrl && (
                <Box
                    sx={{
                        maxHeight: "30vh",
                        width: "100%",
                        my: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src={userPost.imageUrl}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                        }}
                    />
                </Box>
            )}
            <CommentForm postId={userPost.postId} />
            <Box
                sx={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    marginTop: 2,
                    marginBottom: 2,
                    flexGrow: 1,
                    maxHeight: "20vh",
                }}
            >
                <CommentList postId={userPost.postId} />
            </Box>

            {userPost.canDelete && (
                <Button onClick={() => deletePost(userPost.postId)}>
                    Delete Post
                </Button>
            )}
        </Box>
    );
}

export default PostView;
