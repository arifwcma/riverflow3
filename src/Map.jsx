import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet"
import MockData from "./MockData.js"

function BoundaryLayer({ boundary }) {
    const map = useMap()

    useEffect(() => {
        if (boundary) {
            const bounds = L.geoJSON(boundary).getBounds()
            map.fitBounds(bounds)
        }
    }, [boundary, map])

    return (
        <GeoJSON data={boundary} style={{ color: "blue", weight: 2, fillOpacity: 0 }} />
    )
}

export default function Map() {
    const [boundary, setBoundary] = useState(null)

    useEffect(() => {
        fetch("/wcma_boundary.geojson")
            .then(res => res.json())
            .then(data => setBoundary(data))
    }, [])

    return (
        <MapContainer
            style={{ height: "600px", width: "100%" }}
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
            {boundary && <BoundaryLayer boundary={boundary} />}
            {MockData.map((loc, idx) => (
                <Marker key={idx} position={[loc.lat, loc.lng]}>
                    <Popup>{loc.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
