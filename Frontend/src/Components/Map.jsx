import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeolocation } from "../hooks/useGeolocation";
import { getNearbyPharmacies } from "../api/index";
import { socket } from "../api/socket";


function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) map.setView([coords.lat, coords.lng], 14);
    }, [coords, map]);
    return null;
}


const normalizeStatus = (status) => {
    if (status === 'available') return 'avail';
    if (status === 'low') return 'low';
    if (status === 'unavailable') return 'none';
    return status;
};


const makeIcon = (status) => L.divIcon({
    className: '',
    html: `<div class="custom-marker marker-${status}">+</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
});


function PharmacyPopup({ pharmacy, onReport }) {
    const reports = pharmacy.reports || [];
    return (
        <div style={{ padding: '16px', minWidth: '260px' }}>
            <div style={{ marginBottom: '12px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e8f0ea' }}>
                    {pharmacy.name}
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8a9e90', marginTop: 2 }}>
                    {pharmacy.address}
                </div>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: 12, paddingRight: 4 }}>
                {reports.length > 0 ? reports.map(r => (
                    <div key={r._id} style={{
                        background: '#0a0f0d', borderRadius: 8,
                        padding: '10px 12px', marginBottom: 8,
                        border: '1px solid #1f2e27'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: '#e8f0ea' }}>
                                    {r.medicineName || r.name}
                                </div>
                                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a5e50', marginTop: 2 }}>
                                    {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <span style={{
                                padding: '3px 9px', borderRadius: 99,
                                fontSize: 9, fontFamily: 'DM Mono, monospace',
                                background: r.status === 'available' ? 'rgba(0,232,122,0.1)' : r.status === 'low' ? 'rgba(255,184,77,0.12)' : 'rgba(255,92,92,0.1)',
                                color: r.status === 'available' ? '#00e87a' : r.status === 'low' ? '#ffb84d' : '#ff5c5c',
                                border: `1px solid ${r.status === 'available' ? 'rgba(0,232,122,0.2)' : r.status === 'low' ? 'rgba(255,184,77,0.2)' : 'rgba(255,92,92,0.2)'}`
                            }}>
                                {r.status === 'available' ? 'In Stock' : r.status === 'low' ? 'Low' : 'N/A'}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div style={{ padding: '12px', color: '#4a5e50', fontFamily: 'DM Mono, monospace', fontSize: 11, textAlign: 'center' }}>
                        No recent reports
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                    flex: 1, padding: '8px', borderRadius: 8,
                    background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
                    color: '#00e87a', fontFamily: 'DM Mono, monospace', fontSize: 11, cursor: 'pointer'
                }}>
                    ✓ Verify
                </button>
                <button onClick={onReport} style={{
                    flex: 1, padding: '8px', borderRadius: 8,
                    background: 'transparent', border: '1px solid #1f2e27',
                    color: '#8a9e90', fontFamily: 'DM Mono, monospace', fontSize: 11, cursor: 'pointer'
                }}>
                    + Report
                </button>
            </div>
        </div>
    );
}

export default function Map({ onOpenModal, onPharmacySelect, search, filter }) {
    const { coords } = useGeolocation();
    const [pharmacies, setPharmacies] = useState([]);
    const [activeView, setActiveView] = useState('Map');

    useEffect(() => {
        if (!coords) return;

        const fetchAllData = async () => {
            // 1. Fetch from Overpass API (OSM)
            const query = `
            [out:json];
            (
              node["amenity"="pharmacy"](around:15000, ${coords.lat}, ${coords.lng});
              way["amenity"="pharmacy"](around:15000, ${coords.lat}, ${coords.lng});
              relation["amenity"="pharmacy"](around:15000, ${coords.lat}, ${coords.lng});
            );
            out center;
            `;

            try {
                const osmRes = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query
                });
                const osmData = await osmRes.json();
                
                const osmPharmacies = osmData.elements.map(el => ({
                    _id: `${el.type}-${el.id}`,
                    name: el.tags?.name || "Pharmacy",
                    address: el.tags?.["addr:street"] || "Unknown Address",
                    isOSM: true,
                    location: {
                        coordinates: [
                            el.lon || el.center?.lon,
                            el.lat || el.center?.lat
                        ]
                    },
                    reports: []
                }));

                // 2. Fetch reports from our backend
                const reportsRes = await fetch(`http://127.0.0.1:5001/api/reports/nearby?lat=${coords.lat}&lng=${coords.lng}`);
                const reports = await reportsRes.json();

                // 3. Merge reports into OSM pharmacies
                const merged = osmPharmacies.map(p => {
                    const pharmacyReports = reports.filter(r => 
                        r.pharmacy?.osmId === p._id || 
                        (r.pharmacy?.location?.coordinates[0] === p.location.coordinates[0] && 
                         r.pharmacy?.location?.coordinates[1] === p.location.coordinates[1])
                    );
                    return { ...p, reports: pharmacyReports };
                });

                setPharmacies(merged);
            } catch (err) {
                console.error("Sync error:", err);
            }
        };

        fetchAllData();

        socket.on("new-report", ({ report }) => {
            setPharmacies(prev => prev.map(p => {
                const isMatch = (report.pharmacy?.osmId === p._id) || 
                              (report.pharmacy?.location?.coordinates[0] === p.location.coordinates[0] && 
                               report.pharmacy?.location?.coordinates[1] === p.location.coordinates[1]);
                return isMatch ? { ...p, reports: [report, ...(p.reports || [])] } : p;
            }));
        });

        return () => socket.off("new-report");
    }, [coords]);

    const getPharmacyStatus = (pharmacy) => {
        if (!pharmacy.reports || pharmacy.reports.length === 0) return 'available';
        return pharmacy.reports[0].status;
    };

    const filteredPharmacies = pharmacies.filter(p => {
        const pName = (p.name || "").toLowerCase();
        const searchTerm = (search || "").toLowerCase().trim();

        const hasMatchingReport = (p.reports || []).some(r => {
            const matchFilter = !filter || filter === 'all' || normalizeStatus(r.status) === normalizeStatus(filter);
            const mName = (r.medicineName || "").toLowerCase();
            const gName = (r.genericName || "").toLowerCase();
            return matchFilter && (!searchTerm || mName.includes(searchTerm) || gName.includes(searchTerm));
        });

        if (searchTerm) return pName.includes(searchTerm) || hasMatchingReport;
        if (filter && filter !== 'all') return hasMatchingReport;
        return true;
    });

    if (!coords) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4a5e50', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
            Getting your location…
        </div>
    );

    return (
        <>
            
            <div className="map-toolbar">
                <div>
                    <div className="map-title">Hyderabad — Banjara Hills / Jubilee Hills</div>
                    <div className="map-subtitle">
                        Showing {pharmacies.length} pharmacies · Live updates active
                    </div>
                </div>
                <div className="view-btns">
                    {['Map', 'List', 'Heat'].map(v => (
                        <button
                            key={v}
                            className={`view-btn ${activeView === v ? 'active' : ''}`}
                            onClick={() => setActiveView(v)}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: activeView === 'List' ? 'auto' : 'hidden' }}>
                {activeView === 'List' ? (
                    <div className="pharmacy-list-view">
                        {filteredPharmacies.length === 0 ? (
                            <div className="empty-state">No pharmacies found in this area.</div>
                        ) : (
                            <div className="pharmacy-grid">
                                {filteredPharmacies.map(p => {
                                    const status = getPharmacyStatus(p);
                                    return (
                                        <div key={p._id} className="pharmacy-card">
                                            <div className={`card-status-dot ${status}`} />
                                            <div className="card-content">
                                                <h4>{p.name}</h4>
                                                <p>{p.address}</p>
                                                <div className="card-stats">
                                                    <span>{p.reports?.length || 0} reports</span>
                                                    <span>•</span>
                                                    <span>{normalizeStatus(status).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className="card-action-btn"
                                                onClick={() => { onPharmacySelect?.(p); onOpenModal(); }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <MapContainer
                        center={[coords.lat, coords.lng]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <RecenterMap coords={coords} />

                        {/* user dot */}
                        <CircleMarker
                            center={[coords.lat, coords.lng]}
                            radius={8}
                            pathOptions={{ color: '#6499ff', fillColor: '#6499ff', fillOpacity: 1, weight: 3, opacity: 0.4 }}
                        />
                        <CircleMarker
                            center={[coords.lat, coords.lng]}
                            radius={4}
                            pathOptions={{ color: 'white', fillColor: 'white', fillOpacity: 1, weight: 0 }}
                        />

                        {/* pharmacy markers */}
                        {filteredPharmacies.map(p => {
                            const [lng, lat] = p.location.coordinates;
                            const status = getPharmacyStatus(p);
                            const reportsCount = p.reports?.length || 0;

                            if (activeView === 'Heat') {
                                // Heatmap visualization using overlapping circles
                                return (
                                    <CircleMarker
                                        key={p._id}
                                        center={[lat, lng]}
                                        radius={15 + (reportsCount * 2)}
                                        pathOptions={{
                                            color: status === 'available' ? '#00e87a' : status === 'low' ? '#ffb84d' : '#ff5c5c',
                                            fillColor: status === 'available' ? '#00e87a' : status === 'low' ? '#ffb84d' : '#ff5c5c',
                                            fillOpacity: 0.2 + (reportsCount * 0.05),
                                            weight: 0
                                        }}
                                    >
                                        <Popup>
                                            <PharmacyPopup
                                                pharmacy={p}
                                                onReport={() => onPharmacySelect?.(p)}
                                            />
                                        </Popup>
                                    </CircleMarker>
                                );
                            }

                            return (
                                <Marker
                                    key={p._id}
                                    position={[lat, lng]}
                                    icon={makeIcon(status)}
                                    eventHandlers={{ click: () => onPharmacySelect?.(p) }}
                                >
                                    <Popup>
                                        <PharmacyPopup
                                            pharmacy={p}
                                            onReport={() => onPharmacySelect?.(p)}
                                        />
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                )}

                {/* Legend */}
                <div className="map-legend">
                    <div className="legend-title">Availability</div>
                    {[
                        { color: '#00e87a', label: 'In Stock' },
                        { color: '#ffb84d', label: 'Low Stock' },
                        { color: '#ff5c5c', label: 'Unavailable' },
                        { color: '#6499ff', label: 'Your Location' },
                    ].map(({ color, label }) => (
                        <div className="legend-item" key={label}>
                            <div className="legend-dot" style={{ background: color }} />
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}