import {
    Map,
    type LngLat,
    type MapLayerMouseEvent,
} from "@vis.gl/react-maplibre";
import { Box, Fab, Snackbar, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useEffect, useCallback } from "react";
import PostModal, { type Post } from "./PostModal";
import { useBulletinApi } from "../bulletin-api";
import { useQuery } from "@tanstack/react-query";
import { SignedIn } from "@clerk/clerk-react";
import { useModal } from "../hooks/useModal";
import { PostMarkers } from "./PostMarkers";

export default function Home() {
    const { get } = useBulletinApi();
    const [placingMarker, setPlacingMarker] = useState(false);

    const postModal = useModal<Post | LngLat>();

    const { data: posts } = useQuery({
        queryKey: ["personal_posts"],
        queryFn: async () => {
            const res = await get("/posts/get-personal-posts");
            return res.data?.posts ?? [];
        },
        retry: false,
        initialData: [],
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && placingMarker) setPlacingMarker(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [placingMarker]);

    const handleMapClick = useCallback(
        (e: MapLayerMouseEvent) => {
            if (!placingMarker) return;
            setPlacingMarker(false);
            postModal.open("create", e.lngLat);
        },
        [placingMarker, postModal]
    );

    return (
        <Box sx={{ position: "relative" }}>
            <Map
                initialViewState={{
                    longitude: -76.9425363,
                    latitude: 38.9859963,
                    zoom: 10,
                }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                style={{ height: "calc(100vh - 64px)", width: "100%" }}
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
                <PostMarkers
                    posts={posts}
                    onMarkerClick={(post) => postModal.open("view", post)}
                />
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

                <PostModal
                    open={postModal.isOpen}
                    mode={postModal.mode}
                    data={postModal.data}
                    onClose={postModal.close}
                />
            </SignedIn>
        </Box>
    );
}
