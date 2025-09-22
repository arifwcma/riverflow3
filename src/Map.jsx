import React from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MockData from "./MockData.js"

function Map() {
    const bounds = [
        [-37.36809668716929, 140.96378317173532],
        [-35.65680550597246, 143.36396129024806]
    ]

    return (
        <MapContainer
            style={{ height: "600px", width: "100%" }}
            bounds={bounds}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            touchZoom={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
            />
            {MockData.map((loc, idx) => (
                <Marker key={idx} position={[loc.lat, loc.lng]}>
                    <Popup>{loc.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}

export default Map
