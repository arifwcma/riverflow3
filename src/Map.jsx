import React, { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Pane, Tooltip } from "react-leaflet"
import L from "leaflet"
import stations from "../stations_15.json"
import stationDetails from "../station_details.json"
import More from "./More.jsx"

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
    const [stationData, setStationData] = useState({})
    const [moreStation, setMoreStation] = useState(null)

    useEffect(() => {
        fetch("/wcma_boundary.geojson")
            .then(res => res.json())
            .then(data => setBoundary(data))
    }, [])

    const detailsLookup = useMemo(() => {
        return stationDetails.stations.reduce((acc, s) => {
            acc[s.name] = s
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

    const fetchStationData = async (stationId, stationName) => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE
            const res = await fetch(`${API_BASE}/api/station/${stationId}`)
            if (!res.ok) throw new Error("Server error")
            const data = await res.json()
            setStationData(prev => ({ ...prev, [stationName]: data }))
        } catch (err) {
            console.error("Error fetching station data", err)
        }
    }

    const renderPopupContent = (stationName, stationId) => {
        const detail = detailsLookup[stationName]
        const display = detail?.display || stationName
        const data = stationData[stationName]
        if (!data) return <div>Loading...</div>

        const getValue = (label) => {
            const item = data.find(d => d.parameterLabel.includes(label))
            return item ? `${item.v} ${item.units}` : "N/A"
        }

        const updated = data[0]?.dt
            ? new Date(data[0].dt).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "medium" })
            : ""

        return (
            <div>
                <b>{display}</b>
                <br /><br />
                <b>Water Flow</b> {getValue("Stream Discharge")}
                <br />
                <b>Water Level</b> {getValue("Stream Water Level")}
                <br />
                <b>Dissolved Oxygen</b> {getValue("Dissolved Oxygen")}
                <br />
                <b>Conductivity</b> {getValue("Conductivity")}
                <br /><br />
                <small>Last Updated {updated}</small>
                <div style={{ textAlign: "center", marginTop: 10 }}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            const match = stations.find(s => s.station_name === stationName)
                            setMoreStation({
                                id: stationId,
                                key: stationName,
                                lat: parseFloat(match?.station_latitude),
                                lng: parseFloat(match?.station_longitude),
                            })
                        }}
                    >
                        More information
                    </a>

                </div>
            </div>
        )
    }

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
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
                const detail = detailsLookup[loc.station_name]
                const isActive = detail?.status === 1
                const lat = parseFloat(loc.station_latitude)
                const lng = parseFloat(loc.station_longitude)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

                return (
                    <Marker
                        key={idx}
                        position={[lat, lng]}
                        icon={isActive ? activeIcon : inactiveIcon}
                        eventHandlers={
                            isActive
                                ? {
                                    click: () => fetchStationData(loc.station, loc.station_name)
                                }
                                : {}
                        }
                    >
                        <Tooltip>{detail?.display || loc.station_name}</Tooltip>
                        {isActive && (
                            <Popup>
                                {renderPopupContent(loc.station_name, loc.station)}
                            </Popup>
                        )}
                    </Marker>
                )
            })}

            {moreStation && Number.isFinite(moreStation.lat) && Number.isFinite(moreStation.lng) && (
                <Popup
                    position={[moreStation.lat, moreStation.lng]}
                    onClose={() => setMoreStation(null)}
                >
                    <More
                        stationId={moreStation.id}
                        stationName={detailsLookup[moreStation.key]?.display || moreStation.key}
                    />
                </Popup>
            )}

        </MapContainer>
    )
}
