import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../components/Home";
import type { ReactElement } from "react";
import HomeIcon from "@mui/icons-material/Home";

type TabRoute = {
    label: string;
    path: string;
    icon: ReactElement;
};
export const tabRoutes: TabRoute[] = [
    { label: "Home", path: "/home", icon: <HomeIcon /> },
];

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/home" /> },
            { path: "home", element: <Home /> },
        ],
    },
]);
