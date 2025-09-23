import React, { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Pane } from "react-leaflet"
import L from "leaflet"
import stations from "../stations_15.json"
import stationStatus from "../station_status.json"

const bounds = [
    [-37.36809668716929, 140.96378317173532],
    [-35.65680550597246, 143.36396129024806]
]

const activeIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41]
})

const inactiveIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

export default function Map() {
    const [boundary, setBoundary] = useState(null)

    useEffect(() => {
        fetch("/wcma_boundary.geojson")
            .then(res => res.json())
            .then(data => setBoundary(data))
    }, [])

    const statusLookup = useMemo(() => {
        return stationStatus.stations.reduce((acc, s) => {
            acc[s.name] = s.status
            return acc
        }, {})
    }, [])

    const maskFeature = useMemo(() => {
        if (!boundary || !boundary.features || boundary.features.length === 0) return null

        const worldRing = [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90]
        ]

        const holes = []
        for (const f of boundary.features) {
            const g = f.geometry
            if (!g) continue
            if (g.type === "Polygon") {
                if (g.coordinates && g.coordinates[0]) holes.push(g.coordinates[0])
            } else if (g.type === "MultiPolygon") {
                if (g.coordinates) {
                    for (const poly of g.coordinates) {
                        if (poly && poly[0]) holes.push(poly[0])
                    }
                }
            }
        }
        if (holes.length === 0) return null

        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [worldRing, ...holes]
            }
        }
    }, [boundary])

    return (
        <MapContainer
            style={{ height: "600px", width: "100%" }}
            bounds={bounds}
            maxBounds={bounds}
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

            {boundary && (
                <GeoJSON
                    data={boundary}
                    style={{ color: "blue", weight: 2, fillOpacity: 0 }}
                />
            )}

            {maskFeature && (
                <Pane name="mask-pane" style={{ zIndex: 350 }}>
                    <GeoJSON
                        data={maskFeature}
                        style={{
                            fillColor: "white",
                            fillOpacity: 1,
                            color: "none"
                        }}
                        pathOptions={{ fillRule: "evenodd" }}
                    />
                </Pane>
            )}

            {stations.map((loc, idx) => {
                const isActive = statusLookup[loc.station_name] === 1
                const lat = parseFloat(loc.station_latitude)
                const lng = parseFloat(loc.station_longitude)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
                return (
                    <Marker
                        key={idx}
                        position={[lat, lng]}
                        icon={isActive ? activeIcon : inactiveIcon}
                    >
                        <Popup>
                            <b>{loc.station_name}</b>
                            <br />
                            Status: {isActive ? "Active" : "Inactive"}
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}
