# 🏥 MedMap — Real-Time Pharmacy Availability Tracker

> A modern, real-time, location-aware web app that helps users find nearby pharmacies and check medicine availability instantly.

---

## 🚀 Overview

**MedMap** is a full-stack (frontend-focused) application designed to solve a real-world problem — **finding medicines quickly in nearby pharmacies**.

Users can:

* 📍 Discover pharmacies around them using live geolocation
* 💊 Search medicines by brand or generic name
* 📊 View real-time availability (In Stock / Low / Unavailable)
* 📝 Report medicine availability to help others
* 🔄 See live updates via WebSockets

---

## ✨ Key Features

### 🌍 Location-Based Discovery

* Uses browser geolocation to detect user position
* Dynamically fetches nearby pharmacies using **OpenStreetMap (Overpass API)**
* No API key required → fully free & scalable

---

### 🗺️ Interactive Map

* Built with **Leaflet.js**
* Custom markers indicating availability status:

  * 🟢 In Stock
  * 🟡 Low Stock
  * 🔴 Unavailable
* Smooth map recentering based on user location

---

### 🔎 Smart Search & Filtering

* Search by:

  * Medicine name
  * Generic name
  * Pharmacy name
* Filters:

  * All
  * Available
  * Low Stock
  * Unavailable

---

### ⚡ Real-Time Updates

* Powered by WebSockets
* Instant updates when a new report is submitted
* Ensures **community-driven accuracy**

---

### 🧾 Crowdsourced Reporting

* Users can:

  * Report medicine availability
  * Verify existing reports
* Encourages a **collaborative healthcare ecosystem**

---

### 🔐 Authentication System

* Secure login/register flow
* Token-based authentication
* Restricted actions for authenticated users

---

### 📊 Multiple Views

* 🗺️ Map View
* 📋 List View
* 🔥 Heat View (availability density visualization)

---

## 🛠️ Tech Stack

### Frontend

* ⚛️ React.js (Hooks-based architecture)
* 🗺️ Leaflet.js (Map rendering)
* 🎨 Custom UI (minimal + modern design)

### Backend (Optional / Extendable)

* Node.js / Express (API layer)
* WebSocket (real-time updates)

### APIs & Data

* 🌍 OpenStreetMap
* 🔎 Overpass API (pharmacy data)

---

## 📂 Project Structure

```
src/
├── Components/
│   ├── Map.jsx
│   ├── MedicineList.jsx
│   ├── ReportModal.jsx
│   ├── Header.jsx
│   ├── Login.jsx
│   └── Register.jsx
│
├── hooks/
│   └── useGeolocation.js
│
├── api/
│   └── index.js
│
└── App.jsx
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/medmap.git
cd medmap
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Application

```bash
npm run dev
```

---

## 🌐 How It Works

1. User opens the app
2. Browser requests location permission
3. App fetches nearby pharmacies using Overpass API
4. Data is displayed on map with markers
5. Users search / filter medicines
6. Reports update in real-time via sockets

---

## 📈 Scalability & Design Thinking

* ⚡ API-free architecture using OpenStreetMap → cost-efficient
* 🔄 Real-time system → high user engagement
* 🧠 Smart filtering → optimized UX
* 📍 Location-aware → personalized experience

---

## 🧩 Challenges Solved

* Handling large geospatial datasets (100+ pharmacies)
* Real-time UI updates with minimal re-rendering
* Efficient filtering across nested data (pharmacies + reports)
* Map performance optimization

---

## 💡 Future Enhancements

* 🤖 AI-based medicine availability prediction
* 📊 Pharmacy reliability scoring
* 📦 Medicine reservation system
* 📱 Mobile app (React Native)
* 🧠 Smart recommendations (nearest + available)

---

## 🏆 Why This Project Stands Out

* Solves a **real-world healthcare problem**
* Combines **maps + real-time + crowdsourcing**
* Fully **scalable without paid APIs**
* Clean UI with strong UX thinking
* Production-ready architecture

---

## 👩‍💻 Author

**Tannishtha Mishra**
Frontend Developer | Problem Solver | UI/UX Enthusiast

---

## 📜 License

MIT License

---

⭐ *If you like this project, consider giving it a star!*
