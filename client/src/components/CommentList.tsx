import { Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useComments } from "../hooks/useComments";
import { useDeleteComment } from "../hooks/useDeleteComment";

type CommentsListProps = {
    postId: number;
};

export default function CommentList({ postId }: CommentsListProps) {
    const { data: comments, isLoading } = useComments(postId);
    const { deleteComment } = useDeleteComment(postId);

    if (isLoading) return <Typography>Loading comments...</Typography>;

    if (!comments || comments.length === 0)
        return <Typography>No comments yet</Typography>;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {comments.map((c) => (
                <Box
                    key={c.commentId}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        padding: 1,
                    }}
                >
                    <Box>
                        <Typography variant="subtitle2">
                            {c.username}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {c.message}
                        </Typography>
                    </Box>
                    {c.isAuthor && (
                        <IconButton
                            size="small"
                            onClick={() => deleteComment(c.commentId)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            ))}
        </Box>
    );
}
