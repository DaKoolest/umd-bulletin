import { Marker } from "@vis.gl/react-maplibre";
import type { Post } from "./PostModal";

type PostMarkersProps = {
    posts: Post[];
    onMarkerClick: (post: Post) => void;
};

export function PostMarkers({ posts, onMarkerClick }: PostMarkersProps) {
    return (
        <>
            {posts.map((p) => (
                <Marker
                    key={p.postId}
                    longitude={p.pos.lng}
                    latitude={p.pos.lat}
                    onClick={() => onMarkerClick(p)}
                />
            ))}
        </>
    );
}
