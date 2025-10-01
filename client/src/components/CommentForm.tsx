import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useAddComment } from "../hooks/useAddComment";

export type CommentFormProps = {
    postId: number;
};

export default function CommentForm({ postId }: CommentFormProps) {
    const [message, setMessage] = useState("");
    const { addComment } = useAddComment(postId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        addComment(message);
        setMessage("");
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}
        >
            <TextField
                label="Add a comment"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ maxLength: 200 }}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={message.length === 0}
            >
                Post
            </Button>
        </Box>
    );
}
