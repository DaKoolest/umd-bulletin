import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";

export type Comment = {
    commentId: string;
    username: string;
    postId: number;
    message: string;
    createdAt: string;
    isAuthor: boolean;
};

export function useAddComment(postId: number) {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await post("/comments/add-comment", {
                postId,
                message,
            });
            return res.data as Comment;
        },
        onSuccess: (newComment) => {
            queryClient.setQueryData<Comment[]>(["comments", postId], (old) =>
                old ? [...old, newComment] : [newComment]
            );
        },
    });

    return {
        addComment: mutation.mutate,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}
