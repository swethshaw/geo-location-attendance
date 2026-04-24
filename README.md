# 📱 Geo-Attendance System (Assignment Submission)

A location-aware React Native application built to simulate a real-world attendance system with geo-fencing and GPS accuracy constraints.

---

## 1. Overview
This application allows users to mark their attendance only when they are physically within a defined geographic boundary. It focuses on handling native device capabilities (GPS, Permissions) and real-world edge cases like signal inaccuracy.

## 2. Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app (installed on your physical iOS/Android device)

### Steps to Run
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd geo-attendance/mobile
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - Copy `.env.example` to `.env`.
   - Set `EXPO_PUBLIC_API_URL` to your backend IP (e.g., `http://192.168.1.10:3000/api`).
4. **Start the project**:
   ```bash
   npx expo start
   ```
5. **Open on Device**: Scan the QR code using the **Expo Go** app.

---

## 3. Key Technical Decisions

### 📍 Geo-fencing Logic: Haversine Formula
I implemented the **Haversine formula** (`src/utils/geofence.ts`) to calculate the great-circle distance between the user's current GPS coordinates and the target center point.
- **Approach**: Instead of using a library, I implemented the math manually to demonstrate an understanding of geographic coordinates. The formula accounts for the Earth's curvature, providing high precision over short distances.
- **Decision**: Using a custom implementation avoids "library bloat" and ensures that the core logic is transparent and easily auditable.

### 🎯 Accuracy Handling Decisions
- **Threshold**: I defined a strict threshold of **50 meters**.
- **Reasoning**: Real-world GPS data often "drifts." A threshold of 50m ensures that we aren't accepting "guesses" from the device. If the device reports an accuracy of ±120m, the user might actually be outside the radius even if the point appears inside. 
- **Implementation**: The "Mark Attendance" button is dynamically disabled, and a visual "Accuracy Gauge" provides real-time feedback to the user about their signal quality.

### 🏗 State Management
- **React Context**: Used for global authentication state (`AuthContext.tsx`).
- **Hooks**: Heavy use of custom hooks (`useLocation.ts`, `useGeofence.ts`) to separate business logic from UI components, following the "Separation of Concerns" principle.

---

## 4. Edge Case Handling

- **Permission Denied**: Handled via `Location.requestForegroundPermissionsAsync()`. If denied, the app shows a dedicated "Permission Required" screen with a retry button.
- **Location Unavailable/Timeout**: I implemented a **15-second timeout** for fetching the current position. If the device fails to get a fix (e.g., inside a basement), the user is notified to move to a clearer area.
- **Offline Resilience**: Attendance records are cached in `AsyncStorage` (`src/utils/storage.ts`) if the initial database sync fails, ensuring no data loss during poor connectivity.

---

## 5. Assumptions
- **Device GPS**: I assume the device has a functional GPS/GNSS receiver. Cellular-only location is treated as "low accuracy" and will likely fail the 50m threshold.
- **Fixed Center**: For this assignment, center locations are dynamically fetched from the backend but can be defaulted to a hardcoded coordinate if the API is unreachable.
- **Active Session**: The app assumes an active user session is required to link the attendance record to a specific identity.

---

## 6. Known Limitations
- **Indoor Accuracy**: GPS signals are often blocked by concrete. The 50m accuracy requirement might be hard to meet deep indoors.
- **Mock Locations**: While the accuracy threshold prevents some spoofing, dedicated "GPS Spoofer" apps on rooted devices might still bypass basic checks without native-level anti-cheat implementation.
- **Battery Usage**: Continuous high-accuracy location watching can be battery-intensive; the app disconnects the watcher when the screen is blurred.

---
**Role**: Mobile Engineer Intern (React Native)  
**Author**: Sweth shaw
