import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";
import type { Post } from "../components/PostModal";

export function useDeletePost(onClose?: () => void) {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (postId: number) => {
            await post("/posts/delete-post", { postId });
            return postId;
        },
        onSuccess: (deletedPostId) => {
            queryClient.setQueryData<Post[]>(["personal_posts"], (old) =>
                old ? old.filter((p) => p.postId !== deletedPostId) : []
            );
            if (onClose) onClose();
        },
        onError: (e) => {
            console.error("Failed to delete post:", e);
        },
    });

    return {
        deletePost: mutation.mutate,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}
