import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";
import type { Post } from "../components/PostModal";
import type { LngLat } from "@vis.gl/react-maplibre";

export function useCreatePost() {
    const { post } = useBulletinApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            body: string;
            pos: LngLat;
            imageFile?: File | null;
        }) => {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("body", data.body);
            formData.append("location", JSON.stringify(data.pos));
            if (data.imageFile) formData.append("image", data.imageFile);

            const res = await post("/posts/create-post", formData);
            return res.data as Post;
        },
        onSuccess: (newPost) => {
            queryClient.setQueryData<Post[]>(["personal_posts"], (old) =>
                old ? [...old, newPost] : [newPost]
            );
        },
    });
}
