import {
    Box,
    Button,
    Card,
    Fade,
    IconButton,
    Modal,
    TextField,
    Typography,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import type { LngLat } from "@vis.gl/react-maplibre";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useState } from "react";
import { useBulletinApi } from "../bulletin-api";
import { useQueryClient } from "@tanstack/react-query";

export type Post = {
    author?: string;
    title: string;
    body: string;
    likes: number;
    pos: LngLat;
    hasUserLiked: boolean;
    canDelete: boolean;
    postId: number;
    createdAt: Date;
};

export type PostModalProps = {
    open: boolean;
    mode: "create" | "view" | "edit";
    userPost?: Post;
    pos?: LngLat;
    handleClose: () => void;
};

function PostModal({ open, mode, pos, userPost, handleClose }: PostModalProps) {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const TITLE_MAX = 25;
    const BODY_MAX = 100;
    const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateAll()) {
            console.log("Submitted:", { title, body, pos });

            post("/create-post", { title: title, body: body, location: pos })
                .then((res) => {
                    const personalPosts: Post[] | undefined =
                        queryClient.getQueryData(["personal_posts"]);

                    queryClient.setQueryData(
                        ["personal_posts"],
                        personalPosts
                            ? [...personalPosts, res.data]
                            : [res.data]
                    );
                })
                .catch((e: Error) => console.error(e))
                .finally(handleClose);
        }
    };

    const validateAll = () => {
        const isTitleValid = validateTitle(title);
        const isBodyValid = validateBody(body);
        return isTitleValid && isBodyValid;
    };

    const validateTitle = (title: string): boolean => {
        const newErrors: { title?: string } = {};

        if (!title) newErrors.title = "Title is required";
        else if (title.length > TITLE_MAX)
            newErrors.title = `Title must be at most ${TITLE_MAX} characters`;
        else newErrors.title = undefined;

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return newErrors.title === undefined;
    };

    const validateBody = (body: string): boolean => {
        const newErrors: { body?: string } = {};
        if (!body) newErrors.body = "Body is required";
        else if (body.length > BODY_MAX)
            newErrors.body = `Body must be at most ${BODY_MAX} characters`;
        else newErrors.body = undefined;

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return newErrors.body === undefined;
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 200,
                },
            }}
        >
            <Fade in={open}>
                <Card
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "25%",
                    }}
                >
                    {mode === "create" ? (
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
                                onChange={(e) => {
                                    validateTitle(e.target.value);
                                    setTitle(e.target.value);
                                }}
                                error={!!errors.title}
                                helperText={errors.title}
                                required
                            />
                            <TextField
                                label="Body"
                                value={body}
                                onChange={(e) => {
                                    validateBody(e.target.value);
                                    setBody(e.target.value);
                                }}
                                multiline
                                rows={4}
                                required
                                error={!!errors.body}
                                helperText={errors.body}
                            />
                            <Button type="submit" color="primary">
                                Create Post
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                padding: 2,
                            }}
                        >
                            <Typography variant="h6">
                                {userPost?.title}
                            </Typography>
                            <Typography sx={{ mt: -1 }} variant="caption">
                                {userPost?.author}
                            </Typography>

                            <Typography>{userPost?.body}</Typography>

                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <IconButton>
                                    <ThumbUpIcon />
                                </IconButton>
                                <Typography>{userPost?.likes}</Typography>
                            </Box>

                            {userPost?.canDelete && (
                                <Button
                                    onClick={() => {
                                        post("delete-post", {
                                            postId: userPost?.postId,
                                        })
                                            .then(() => {
                                                const personalPosts:
                                                    | Post[]
                                                    | undefined =
                                                    queryClient.getQueryData([
                                                        "personal_posts",
                                                    ]);

                                                queryClient.setQueryData(
                                                    ["personal_posts"],
                                                    personalPosts
                                                        ? personalPosts.filter(
                                                              (post) =>
                                                                  post !==
                                                                  userPost
                                                          )
                                                        : []
                                                );
                                                handleClose();
                                            })
                                            .catch((e: Error) =>
                                                console.error(e)
                                            );
                                    }}
                                >
                                    Delete Post
                                </Button>
                            )}
                        </Box>
                    )}
                </Card>
            </Fade>
        </Modal>
    );
}

export default PostModal;
