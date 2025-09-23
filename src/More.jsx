import React, { useEffect, useState } from "react"
import Chart from "react-apexcharts"

export default function More({ stationId, stationName }) {
    const [flow, setFlow] = useState([])
    const [oxygen, setOxygen] = useState([])
    const [cond, setCond] = useState([])

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE

        const load = async (endpoint, setter) => {
            try {
                const res = await fetch(`${API_BASE}/api/${endpoint}/${stationId}?t=${Date.now()}`)
                const raw = await res.json()
                setter(raw.map(d => [new Date(d.dt).getTime(), d.v]))
            } catch (e) {
                console.error("Error fetching", endpoint, e)
            }
        }

        load("flow", setFlow)
        load("oxygen", setOxygen)
        load("conductivity", setCond)
    }, [stationId])

    const makeOptions = (title, yTitle, unit) => ({
        chart: {
            type: "area",
            zoom: { enabled: true },
            toolbar: { autoSelected: "zoom", tools: { reset: true } }
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" },
        title: { text: title, align: "left" },
        xaxis: { type: "datetime" },
        yaxis: { title: { text: yTitle } },
        tooltip: {
            x: { format: "dd MMM yyyy HH:mm" },
            y: { formatter: (val) => `${val} ${unit}` }
        }
    })

    return (
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 600px", padding: 10 }}>
                <h3>Summary: {stationName}</h3>

                <Chart options={makeOptions("Flow Rate (ML/d)", "Flow", "ML/d")} series={[{ data: flow }]} type="area" height={250} />

                <Chart options={makeOptions("Dissolved Oxygen (mg/L)", "DO", "mg/L")} series={[{ data: oxygen }]} type="area" height={250} />

                <Chart options={makeOptions("Conductivity (µS/cm)", "Conductivity", "µS/cm")} series={[{ data: cond }]} type="area" height={250} />
            </div>

            <div style={{ flex: "1 1 300px", padding: 10 }}>
                <h4>Location</h4>
                <img
                    src="https://via.placeholder.com/300x200?text=Google+Map+Panel"
                    alt="Location"
                    style={{ width: "100%", marginBottom: 20 }}
                />
                <h4>Historic Photos</h4>
                <img
                    src="https://via.placeholder.com/300x150?text=Photo+1"
                    alt="Photo 1"
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <img
                    src="https://via.placeholder.com/300x150?text=Photo+2"
                    alt="Photo 2"
                    style={{ width: "100%" }}
                />
            </div>
        </div>
    )
}
