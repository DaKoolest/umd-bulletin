import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";

export function useDeleteComment(postId: number) {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (commentId: string) => {
            await post("/comments/delete-comment", {
                commentId: commentId,
            });
            return commentId;
        },
        onSuccess: (deletedCommentId) => {
            queryClient.setQueryData<any[]>(["comments", postId], (old) =>
                old ? old.filter((c) => c.commentId !== deletedCommentId) : []
            );
        },
    });

    return {
        deleteComment: mutation.mutate,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}
