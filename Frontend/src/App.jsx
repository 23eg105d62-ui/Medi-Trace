import { useState } from "react";
import Header from "./Components/Header";
import Map from "./Components/Map";
import MedicineList from "./Components/MedicineList";
import ReportModal from "./Components/ReportModal";
import Toast from "./Components/Toast";

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  return (
    <>
      <Header onOpenModal={() => setShowModal(true)} />

      <div className="app-layout">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="search-area">
            <div className="search-label">Find Medicine</div>

            {/* SEARCH */}
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                placeholder="Drug name, generic, pharmacy…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* FILTER */}
            <div className="filter-row">
              {["all", "available", "low", "unavailable"].map(f => (
                <button
                  key={f}
                  className={`filter-chip ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all"
                    ? "All"
                    : f === "available"
                      ? "Available"
                      : f === "low"
                        ? "Low Stock"
                        : "Unavailable"}
                </button>
              ))}
            </div>
          </div>

          <MedicineList
            setToast={setToast}
            filter={filter}
            search={search}
          />
        </div>

        {/* MAP */}
        <div className="map-area">
          <Map
            onOpenModal={() => setShowModal(true)}
            onPharmacySelect={setSelectedPharmacy}
          />
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <ReportModal
          onClose={() => setShowModal(false)}
          setToast={setToast}
          pharmacyId={selectedPharmacy?._id}
        />
      )}

      {/* TOAST */}
      <Toast message={toast} />
    </>
  );
}

export default App;