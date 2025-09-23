import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet"
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

    const statusLookup = stationStatus.stations.reduce((acc, s) => {
        acc[s.name] = s.status
        return acc
    }, {})

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
            {stations.map((loc, idx) => {
                const isActive = statusLookup[loc.station_name] === 1
                return (
                    <Marker
                        key={idx}
                        position={[parseFloat(loc.station_latitude), parseFloat(loc.station_longitude)]}
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
