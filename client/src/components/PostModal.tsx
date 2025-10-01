import { Card, Fade, Modal } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import type { LngLat } from "@vis.gl/react-maplibre";
import PostView from "./PostView";
import PostForm from "./PostForm";

export type Post = {
    author: string;
    title: string;
    body: string;
    likes: number;
    pos: LngLat;
    hasUserLiked: boolean;
    canDelete: boolean;
    postId: number;
    createdAt: Date;
    imageUrl?: string;
};

export type PostModalProps = {
    open: boolean;
    mode: "create" | "view";
    data: Post | LngLat | null;
    onClose: () => void;
};

function PostModal({ open, mode, data, onClose }: PostModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
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
                        width: "40%",
                        maxHeight: "80vh",
                    }}
                >
                    {mode === "create" && (
                        <PostForm pos={data as LngLat} onClose={onClose} />
                    )}
                    {mode === "view" && data && (
                        <PostView userPost={data as Post} onClose={onClose} />
                    )}
                </Card>
            </Fade>
        </Modal>
    );
}

export default PostModal;
