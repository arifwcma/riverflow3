import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import mockLocations from "./MockData"

const bounds = [
    [-37.36809668716929, 140.96378317173532],
    [-35.65680550597246, 143.36396129024806]
]

const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
})

export default function Map() {
    return (
        <MapContainer
            style={{ height: "100vh", width: "100%" }}
            bounds={bounds}
            zoomControl={false}
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            touchZoom={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {mockLocations.map(loc => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={markerIcon}>
                    <Popup>{loc.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
