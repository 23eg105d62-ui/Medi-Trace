import { useState, useEffect } from "react";
import Map from "./Components/Map";
import MedicineList from "./Components/MedicineList";
import ReportModal from "./Components/ReportModal";
import Header from "./Components/Header";
import Toast from "./Components/Toast";
import Login from "./Components/Login";
import Register from "./Components/Register";
import { getMe } from "./api/index";

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState("");
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [reportCount, setReportCount] = useState(94);
    
    // Auth state
    const [user, setUser] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            getMe()
                .then(res => setUser(res.data.payload)) // extract from payload
                .catch(() => localStorage.removeItem("token"));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToast("Logged out");
    };

    const handleAuthSuccess = (userData) => {
        setIsAuthOpen(false);
        setUser(userData); // loginUser already returns payload in SUCCESS
    };

    const handleOpenModal = (pharmacy = null) => {
        if (!user) {
            setAuthMode("register");
            setIsAuthOpen(true);
            setToast("Please sign up to report availability");
            return;
        }
        setSelectedPharmacy(pharmacy);
        setIsModalOpen(true);
    };

    return (
        <div>
            <Header 
                user={user}
                onSignIn={() => { setAuthMode("login"); setIsAuthOpen(true); }}
                onLogout={handleLogout}
                onOpenModal={() => handleOpenModal()} 
                reportCount={reportCount} 
            />

            <div className="app-layout">
                {/* Sidebar */}
                <div className="sidebar">
                    {/* Search + Filter */}
                    <div className="search-area">
                        <div className="search-label">Find Medicine</div>
                        <div className="search-box">
                            <span className="search-icon">⌕</span>
                            <input
                                placeholder="Drug name, generic, condition…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="filter-row">
                            {["all", "available", "low", "unavailable"].map(f => (
                                <button
                                    key={f}
                                    className={`filter-chip ${filter === f ? "active" : ""}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === "all" ? "All" :
                                     f === "available" ? "Available" :
                                     f === "low" ? "Low Stock" : "Unavailable"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <MedicineList 
                        setToast={setToast} 
                        filter={filter} 
                        search={search} 
                        onCountUpdate={setReportCount}
                    />
                </div>

                {/* Map */}
                <div className="map-area">
                    <Map
                        onOpenModal={() => handleOpenModal(selectedPharmacy)}
                        onPharmacySelect={p => handleOpenModal(p)}
                        search={search}
                        filter={filter}
                    />
                </div>
            </div>

            {isModalOpen && (
                <ReportModal
                    pharmacy={selectedPharmacy}
                    onClose={() => { setIsModalOpen(false); setSelectedPharmacy(null); }}
                    setToast={setToast}
                />
            )}

            {isAuthOpen && (
                <div className="auth-overlay" onClick={() => setIsAuthOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        {authMode === "login" ? (
                            <Login 
                                onToggle={() => setAuthMode("register")} 
                                onSuccess={handleAuthSuccess}
                                setToast={setToast}
                            />
                        ) : (
                            <Register 
                                onToggle={() => setAuthMode("login")} 
                                onSuccess={() => setAuthMode("login")}
                                setToast={setToast}
                            />
                        )}
                    </div>
                </div>
            )}

            <Toast message={toast} />
        </div>
    );
}

export default App;