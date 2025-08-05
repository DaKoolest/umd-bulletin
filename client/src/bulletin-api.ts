import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export function useBulletinApi() {
    const { getToken } = useAuth();

    const apiClient = axios.create({
        baseURL: "/bulletin",
    });

    apiClient.interceptors.request.use(
        async (config) => {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    const get = (url: string, config = {}) => {
        console.log(url);
        return apiClient.get(url, config);
    };

    const post = (url: string, data: Object, config = {}) => {
        return apiClient.post(url, data, config);
    };

    return { get, post };
}
