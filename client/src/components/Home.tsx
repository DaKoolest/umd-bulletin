import { Map, Marker, type MapLayerMouseEvent } from "@vis.gl/react-maplibre";
import { Box, Button, Fab, Snackbar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useEffect, useCallback } from "react";
import PostModal, { type Post, type PostModalProps } from "./PostModal";
import { useBulletinApi } from "../bulletin-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SignedIn, SignIn, useAuth } from "@clerk/clerk-react";

function Home() {
    const { get } = useBulletinApi();
    const { userId } = useAuth();
    const [placingMarker, setPlacingMarker] = useState<boolean>(false);
    const [postModalProps, setPostModalProps] = useState<PostModalProps>({
        open: false,
        mode: "create",
        handleClose: () => handlePostModalClose(),
    });

    const handlePostModalClose = () => {
        setPostModalProps((prev) => ({ ...prev, open: false }));
    };

    const { data } = useQuery({
        queryKey: ["personal_posts"],
        queryFn: async () => {
            const res = await get("/get-personal-posts");
            return res.data?.posts ?? [];
        },
        retry: false,
        enabled: !!userId,
        initialData: [],
    });

    const handleMapClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (placingMarker) {
                setPlacingMarker(false);
                setPostModalProps({
                    ...postModalProps,
                    open: true,
                    mode: "create",
                    pos: e.lngLat,
                });
            }
        },
        [placingMarker]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && placingMarker) {
                setPlacingMarker(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [placingMarker]);

    return (
        <Box
            sx={{
                position: "relative",
            }}
        >
            <Map
                initialViewState={{
                    longitude: -76.9425363,
                    latitude: 38.9859963,
                    zoom: 10,
                }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                style={{
                    height: "calc(100vh - 64px)",
                    width: "100%",
                }}
                dragRotate={false}
                touchPitch={false}
                touchZoomRotate={false}
                pitchWithRotate={false}
                dragPan={!placingMarker}
                scrollZoom={!placingMarker}
                doubleClickZoom={!placingMarker}
                keyboard={!placingMarker}
                cursor={placingMarker ? "pointer" : undefined}
                maxBounds={[
                    [-76.9425363 - 0.037, 38.9859963 - 0.03],
                    [-76.9425363 + 0.037, 38.9859963 + 0.03],
                ]}
                onClick={handleMapClick}
            >
                {data?.map((p: Post, index: number) => (
                    <Marker
                        key={index}
                        longitude={p.pos.lng}
                        latitude={p.pos.lat}
                        onClick={() => {
                            setPostModalProps({
                                ...postModalProps,
                                open: true,
                                mode: "view",
                                userPost: p,
                            });
                        }}
                    />
                ))}
            </Map>

            <SignedIn>
                <Fab
                    sx={{ position: "absolute", right: 16, top: 16 }}
                    color="primary"
                    aria-label="add"
                    onClick={() => setPlacingMarker(true)}
                >
                    <AddIcon />
                </Fab>
                <Snackbar
                    open={placingMarker}
                    message="Click on the map to place your pin"
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    action={
                        <Button
                            color="primary"
                            size="small"
                            onClick={() => setPlacingMarker(false)}
                        >
                            Cancel
                        </Button>
                    }
                />
                <PostModal {...postModalProps} />
            </SignedIn>
        </Box>
    );
}

export default Home;
