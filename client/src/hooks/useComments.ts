import { useQuery } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";
import type { Comment } from "./useAddComment";

export function useComments(postId: number) {
    const { get } = useBulletinApi();

    return useQuery<Comment[]>({
        queryKey: ["comments", postId],
        queryFn: async () => {
            const res = await get(`/comments/get-comments/${postId}`);
            return res.data as Comment[];
        },
        enabled: !!postId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
