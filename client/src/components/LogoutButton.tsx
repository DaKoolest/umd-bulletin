import { useClerk, useUser } from "@clerk/clerk-react";
import { Avatar, Button, ButtonBase, Popover, Typography } from "@mui/material";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
    bindPopover,
    bindTrigger,
    usePopupState,
} from "material-ui-popup-state/hooks";

function LogoutButton() {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const queryClient = useQueryClient();

    const popupState = usePopupState({
        variant: "popover",
    });

    return (
        <>
            <ButtonBase
                {...bindTrigger(popupState)}
                sx={{ borderRadius: "50%", height: 28, width: 28 }}
            >
                <Avatar src={user?.imageUrl} sx={{ height: 28, width: 28 }} />
            </ButtonBase>
            <Popover
                {...bindPopover(popupState)}
                sx={{ p: 2, mt: 1, width: "378px" }}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                aria-hidden={false}
                slotProps={{
                    paper: {
                        sx: {
                            width: "378px",
                        },
                    },
                }}
            >
                <Button
                    sx={{ width: "100%" }}
                    onClick={() => openUserProfile()}
                >
                    <Typography>Open User Profile</Typography>
                </Button>
                <Button
                    sx={{ width: "100%" }}
                    onClick={() => {
                        queryClient.setQueryData(["personal_posts"], []);
                        signOut();
                    }}
                >
                    <Typography>Logout</Typography>
                </Button>
            </Popover>
        </>
    );
}

export default LogoutButton;
