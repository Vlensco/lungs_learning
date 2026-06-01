# 🫁 RESPIRA 3D — Clinical Anatomical Laboratory Simulator

Interactive 3D anatomical learning system designed to simulate the human respiratory system. Inspired by world-class clinical databases like **TeachMeAnatomy**, this simulator utilizes premium slate-light diagnostics layouts, advanced neural voice guidance, and proximity-based 3D raycasting coordinates for maximum learning fidelity.

---

## ✨ Key Premium Features

*   **📐 Proximity-Based 3D Raycast Click Selector:**
    Although the realistic 3D lung model is a unified mesh (`realistic_human_lungs.glb`), we engineered a **custom 3D math raycast engine**. When you click *anywhere* directly on the 3D surface, the system converts the world space coordinate to local matrix coordinate, isolates the targeted mesh (Airways vs Lobes), and **automatically focuses the nearest anatomical structure**, highlighting it and triggering the voice guide!
*   **🗣️ Premium Neural Voice Assistant (Multi-Language):**
    Integrated with a **Premium Prioritized Neural Voice Selector** (ID/EN). The system bypasses legacy robotic offline speech synthesis to prioritize advanced neural voices like *Microsoft Gadis Online (Natural)*, *Google Bahasa Indonesia*, and Apple’s *Damayanti*, delivering exceptionally natural, calm, human-like clinical explanations.
*   **⚙️ Interactive Respiratory Simulator:**
    Real-time breathing expansion rate controller supporting **Hold (Tahan)**, **Normal**, and **Rapid (Cepat)** states. Visually enhanced with expanding ambient torus waves and wireframe diaphragm muscle excursions.
*   **🎨 Pristine Light Clinical UI Theme:**
    A clean, modern slate-blue and sterile white laboratory interface. Avoids generic "AI dark-neon templates" to ensure a professional, clinical-grade diagnostic look. Fully responsive for desktop, tablet, and mobile screens.
*   **🏷️ Sharp 2D Billboard Labels:**
    Rotational 2D label cards that always face the camera to eliminate overlapping and distortion, tied to 3D hotspots using elegant HSL vector-dashed leader lines.
*   **📊 Integrated Learning Progress Circular Gauge:**
    Tracks explored anatomical structures, computing real-time percentages of mastered sections divided by category chips.

---

## 🛠️ Modular Directory Architecture

We refactored the codebase into a clean, modern, decoupled modular pattern:

```
src/
├── data/
│   └── partData.js         # Localized anatomical database for 19 parts (ID/EN)
├── utils/
│   └── audioSpeech.js      # Web Audio chime chimes & Neural Voice speakTerm
├── components/
│   ├── WelcomeScreen.jsx   # Pre-demo Startup Language modal & LungsIcon vector asset
│   ├── MiniLegend.jsx      # Circular progress gauges & legend category chips
│   ├── PartCard.jsx        # Slide-out medical card sheet (Function, Explanation, Role, Analogy)
│   ├── LungsModel.jsx      # 3D GLTF traverse loader, transparent highlights, and breathing scale
│   ├── Hotspot.jsx         # 2D HTML Billboard tags & Pulsing Hotspot aura pins
│   └── LungScene.jsx       # 3D Canvas, lightings, OrbitControls, and proximity click solver
├── main.jsx                # Highly optimized lightweight core state controller (<250 lines)
└── styles.css              # Custom slate-light Vanilla CSS variables and layouts
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
Clone your workspace and install dependencies:
```bash
npm install
```

### 3. Run Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
*Note: We highly recommend using **Microsoft Edge** or **Google Chrome** to experience the highest fidelity of the Neural Online Natural voices!*

### 4. Build Production Bundle
To compile optimized production-ready static assets:
```bash
npm run build
```
Compiled bundle assets will be output in `/dist/` within **1.6 seconds**.

---

## 🩺 Clinical Landmark Database
The simulator houses **19 distinct anatomical landmarks** categorized into:
*   **Saluran Napas (Respiratory Tract)**: *Trakea, Kartilago Trakea, Karina, Bronkus Utama Kanan, Bronkus Utama Kiri, Bronkus Lobaris, Bronkus Segmentalis*
*   **Lobus Paru (Lung Lobes)**: *Lobus Superior Kanan, Lobus Medius Kanan, Lobus Inferior Kanan, Lobus Superior Kiri, Lobus Inferior Kiri*
*   **Fisura (Anatomical Fissures)**: *Fisura Horizontal Kanan, Fisura Oblique Kanan, Fisura Oblique Kiri*
*   **Mikro (Microscopic Structures)**: *Bronkiolus, Otot Polos Bronkiolus, Alveoli / Sakus Alveolar*
*   **Mekanisme Bernapas (Respiratory Mechanics)**: *Diafragma*

---

## 🏛️ Project Credits
*   **Core UI Styling:** Vanilla CSS
*   **3D Framework:** Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
*   **Anatomical Reference:** TeachMeAnatomy
*   **Engineered by:** Antigravity AI
