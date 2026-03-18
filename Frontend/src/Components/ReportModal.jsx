import { useState, useEffect } from "react";
import { submitReport, getNearbyPharmacies } from "../api/index";
import { useGeolocation } from "../hooks/useGeolocation";

export default function ReportModal({ onClose, setToast, pharmacy: initialPharmacy }) {
    const { coords } = useGeolocation();
    const [medicineName, setMedicineName] = useState("");
    const [genericName, setGenericName] = useState("");
    const [status, setStatus] = useState("available");
    const [loading, setLoading] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState(initialPharmacy);
    const [nearbyPharmacies, setNearbyPharmacies] = useState([]);

    useEffect(() => {
        setSelectedPharmacy(initialPharmacy);
    }, [initialPharmacy]);

    useEffect(() => {
        if (!coords || initialPharmacy) return;
        
        const fetchPharmacies = async () => {
            const query = `
            [out:json];
            (node["amenity"="pharmacy"](around:5000, ${coords.lat}, ${coords.lng}););
            out center;
            `;
            try {
                const res = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: query
                });
                const data = await res.json();
                setNearbyPharmacies(data.elements.map(el => ({
                    _id: `${el.type}-${el.id}`,
                    name: el.tags?.name || "Pharmacy",
                    address: el.tags?.["addr:street"] || "Unknown",
                    location: { coordinates: [el.lon || el.center?.lon, el.lat || el.center?.lat] }
                })));
            } catch (err) { console.error(err); }
        };
        fetchPharmacies();
    }, [coords, initialPharmacy]);

    const handleSubmit = async () => {
        if (!medicineName) { setToast("Medicine name is required"); return; }
        if (!selectedPharmacy) { setToast("Please select a pharmacy"); return; }
        setLoading(true);
        try {
            const payload = {
                medicineName,
                genericName,
                status,
                lng: coords?.lng,
                lat: coords?.lat
            };

            if (selectedPharmacy.osmId || selectedPharmacy.isOSM) {
                payload.osmId = selectedPharmacy._id || selectedPharmacy.osmId;
                payload.pharmacyData = {
                    name: selectedPharmacy.name,
                    address: selectedPharmacy.address,
                    coordinates: selectedPharmacy.location?.coordinates
                };
            } else {
                payload.pharmacyId = selectedPharmacy._id;
            }

            await submitReport(payload);
            setToast(`✓ Report submitted: ${medicineName}`);
            onClose();
        } catch (err) {
            setToast(err.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">Report Medicine Availability</div>
                <div className="modal-subtitle">Help others find life-saving drugs nearby</div>

                <div className="modal-field">
                    <label className="modal-label">Pharmacy</label>
                    <select 
                        className="modal-input" 
                        value={selectedPharmacy?._id || ""} 
                        onChange={e => {
                            const p = nearbyPharmacies.find(ph => ph._id === e.target.value);
                            setSelectedPharmacy(p);
                        }}
                        disabled={!!initialPharmacy}
                    >
                        <option value="">{initialPharmacy ? "Specific Pharmacy Selected" : "Select nearby pharmacy"}</option>
                        {nearbyPharmacies.map(p => (
                            <option key={p._id} value={p._id}>{p.name} — {p.address?.split(',')[0]}</option>
                        ))}
                    </select>
                </div>

                <div className="modal-field">
                    <label className="modal-label">Medicine Name</label>
                    <input className="modal-input" placeholder="e.g. Losartan 50mg…" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
                </div>

                <div className="modal-field">
                    <label className="modal-label">Generic Name</label>
                    <input className="modal-input" placeholder="e.g. Angiotensin II receptor blocker" value={genericName} onChange={e => setGenericName(e.target.value)} />
                </div>

                <div className="modal-field">
                    <label className="modal-label">Availability Status</label>
                    <div className="avail-selector">
                        {[
                            { val: 'available', cls: 'selected-avail', icon: '✅', label: 'In Stock' },
                            { val: 'low', cls: 'selected-low', icon: '⚠️', label: 'Low Stock' },
                            { val: 'unavailable', cls: 'selected-none', icon: '❌', label: 'Unavailable' },
                        ].map(opt => (
                            <div
                                key={opt.val}
                                className={`avail-opt ${status === opt.val ? opt.cls : ''}`}
                                onClick={() => setStatus(opt.val)}
                            >
                                <div className="opt-icon">{opt.icon}</div>
                                <div>{opt.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting…" : "Submit Report →"}
                    </button>
                </div>
            </div>
        </div>
    );
}