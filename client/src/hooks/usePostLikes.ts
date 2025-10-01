import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";

export function usePostLikes(postId: number) {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    const likesQuery = useQuery({
        queryKey: ["likes", postId],
        queryFn: async () =>
            (await post("/likes/get-likes", { likedObjId: postId })).data,
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const toggleLike = () => {
        if (!postId || !likesQuery.data) return;
        const liked = !likesQuery.data.hasUserLiked;
        post("/likes/like", { likedObjId: postId, liked }).catch(console.error);

        queryClient.setQueryData(["likes", postId], {
            likes: likesQuery.data.likes + (liked ? 1 : -1),
            hasUserLiked: liked,
        });
    };

    return { likesQuery, toggleLike };
}
