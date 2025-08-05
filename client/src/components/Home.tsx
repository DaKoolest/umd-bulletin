import { Map } from "@vis.gl/react-maplibre";
import { Box } from "@mui/material";

import "maplibre-gl/dist/maplibre-gl.css";

function Home() {
    return (
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
            maxBounds={[
                [-76.9425363 - 0.037, 38.9859963 - 0.03],
                [-76.9425363 + 0.037, 38.9859963 + 0.03],
            ]}
        />
    );
}

export default Home;
