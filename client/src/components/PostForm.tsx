import { Box, TextField, Button } from "@mui/material";
import { useState } from "react";
import type { LngLat } from "@vis.gl/react-maplibre";
import { validateTitle, validateBody } from "../utils/validatePost";
import { useCreatePost } from "../hooks/useCreatePost";

export type PostFormProps = {
    pos: LngLat;
    onClose: () => void;
};

function PostForm({ pos, onClose }: PostFormProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
    const createPost = useCreatePost();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const titleError = validateTitle(title);
        const bodyError = validateBody(body);
        setErrors({ title: titleError, body: bodyError });

        if (titleError || bodyError) return;

        createPost.mutate(
            { title, body, pos, imageFile },
            { onSuccess: onClose, onSettled: () => setImageFile(null) }
        );
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 2,
            }}
        >
            <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
            />
            <TextField
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                multiline
                rows={4}
                error={!!errors.body}
                helperText={errors.body}
                required
            />
            <input
                accept="image/*"
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <Button type="submit" color="primary">
                Create Post
            </Button>
        </Box>
    );
}

export default PostForm;
