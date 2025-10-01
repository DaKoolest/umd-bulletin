import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";

export function useAutoClearUserCache() {
    const { userId, isLoaded } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId && isLoaded) {
            queryClient.setQueryData(["personal_posts"], []);
        }
    }, [isLoaded, userId]);
}
