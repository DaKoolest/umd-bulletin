import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";
import { Box, Button, Tab, Tabs } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { tabRoutes } from "./router/router";
import "./App.css";

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentTabIndex = tabRoutes.findIndex((route) =>
        location.pathname.startsWith(route.path)
    );

    const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
        navigate(tabRoutes[newIndex].path);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box sx={{ display: "flex", height: 64, boxShadow: 5, zIndex: 30 }}>
                <Tabs
                    value={currentTabIndex === -1 ? 0 : currentTabIndex}
                    onChange={handleTabChange}
                >
                    {tabRoutes.map((route) => (
                        <Tab
                            key={route.path}
                            icon={route.icon}
                            iconPosition="start"
                            label={route.label}
                            sx={{ padding: 0 }}
                        />
                    ))}
                </Tabs>
                <SignedOut>
                    <SignInButton>
                        <Button>Log In</Button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <Box
                        sx={{
                            marginLeft: "auto",
                            marginRight: 3,
                            alignSelf: "center",
                            height: 28,
                        }}
                    >
                        <UserButton />
                    </Box>
                </SignedIn>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
