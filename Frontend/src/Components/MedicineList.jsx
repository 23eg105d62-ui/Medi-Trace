import { useEffect, useState } from "react";
import { socket } from "../api/socket";
import { getNearbyPharmacies } from "../api/index";
import { useGeolocation } from "../hooks/useGeolocation";
import VerifyButton from "./VerifyButton";

const STATUS_LABEL = { available: 'In Stock', low: 'Low Stock', unavailable: 'Unavailable' };

const normalizeStatus = (status) => {
    if (status === 'available') return 'avail';
    if (status === 'low') return 'low';
    if (status === 'unavailable') return 'none';
    return status;
};

export default function MedicineList({ setToast, filter, search, onCountUpdate }) {
    const { coords } = useGeolocation();
    const [reports, setReports] = useState([]);

    useEffect(() => {
        if (!coords) return;
        
        fetch(`http://127.0.0.1:5001/api/reports/nearby?lat=${coords.lat}&lng=${coords.lng}`)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(r => ({
                    ...r,
                    pharmacyName: r.pharmacy?.name || "Unknown Pharmacy",
                    distance: r.pharmacy?.location ? "0.8 km" : "0.5 km" // placeholder logic
                }));
                setReports(formatted);
                onCountUpdate?.(formatted.length);
            });

        const areaKey = `area_${coords.lng.toFixed(1)}_${coords.lat.toFixed(1)}`;
        socket.connect();
        socket.emit("join-area", areaKey);

        socket.on("new-report", ({ report }) => {
            setReports(prev => {
                const updated = [{ ...report, pharmacyName: report.pharmacy?.name }, ...prev];
                onCountUpdate?.(updated.length);
                return updated;
            });
            setToast(`New: ${report.medicineName} reported nearby`);
        });

        socket.on("report-verified", ({ reportId, verifications }) => {
            setReports(prev => prev.map(r =>
                r._id === reportId
                    ? { ...r, verifications: Array(verifications).fill(null) }
                    : r
            ));
        });

        return () => { socket.off("new-report"); socket.off("report-verified"); };
    }, [coords]);

    const filtered = reports.filter(r => {
        const matchFilter = !filter || filter === 'all' || normalizeStatus(r.status) === normalizeStatus(filter);
        
        const mName = (r.medicineName || r.name || "").toLowerCase();
        const gName = (r.genericName || r.generic || "").toLowerCase();
        const pName = (r.pharmacyName || "").toLowerCase();
        const searchTerm = (search || "").toLowerCase().trim();

        const matchSearch = !searchTerm || 
            mName.includes(searchTerm) || 
            gName.includes(searchTerm) || 
            pName.includes(searchTerm);

        return matchFilter && matchSearch;
    });

    const counts = {
        available: reports.filter(r => r.status === 'available').length,
        low: reports.filter(r => r.status === 'low').length,
        unavailable: reports.filter(r => r.status === 'unavailable').length,
    };

    return (
        <>
            {/* Stats */}
            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-num" style={{ color: 'var(--accent)' }}>{counts.available}</div>
                    <div className="stat-label">Available</div>
                </div>
                <div className="stat-item">
                    <div className="stat-num" style={{ color: 'var(--warn)' }}>{counts.low}</div>
                    <div className="stat-label">Low Stock</div>
                </div>
                <div className="stat-item">
                    <div className="stat-num" style={{ color: 'var(--danger)' }}>{counts.unavailable}</div>
                    <div className="stat-label">Not Found</div>
                </div>
            </div>

            <div className="medicine-list">
                <div className="section-header">Showing all results nearby</div>

                {filtered.length === 0 && (
                    <div style={{ padding: '20px 8px', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                        No reports found. Be the first to report!
                    </div>
                )}

                {filtered.map(r => (
                    <div key={r._id} className={`med-card ${r.status}`}>
                        <div className="med-top">
                            <div>
                                <div className="med-name">{r.medicineName}</div>
                                <div className="med-generic">{r.genericName}</div>
                            </div>
                            <div className={`avail-badge ${r.status}`}>
                                {STATUS_LABEL[r.status]}
                            </div>
                        </div>

                        <div className="med-meta">
                            <div className="med-meta-item">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                                {r.distance || '0.5 km'}
                            </div>
                            <div className="med-meta-item">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}><path d="M6 2C4.3 2 3 3.3 3 5c0 2.5 3 5 3 5s3-2.5 3-5c0-1.7-1.3-3-3-3z" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="5" r="1.2" stroke="currentColor" stroke-width="1.2"/></svg>
                                {r.pharmacyName}
                            </div>
                        </div>

                        <div className="verify-row">
                            <div className="verifications">
                                <div className="verify-avatars">
                                    <div className="verify-avatar va-1">A</div>
                                    <div className="verify-avatar va-2">R</div>
                                    <div className="verify-avatar va-3">S</div>
                                </div>
                                &nbsp;{r.verifications?.length || 0} verifications
                            </div>
                            <VerifyButton
                                reportId={r._id}
                                initialCount={r.verifications?.length || 0}
                                coords={coords}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}