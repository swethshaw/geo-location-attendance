# 📱 Geo-Attendance Mobile App

A premium, high-performance React Native application built with Expo for geo-fenced attendance tracking. This app features a sophisticated role-based interface, real-time location validation, and a state-of-the-art glassmorphic design.

---

## 🌟 Key Features

### 👤 Role-Based Experience
The app dynamically adapts its interface based on the authenticated user's role:
- **Admin**: Full control over geo-fence zones, user directory management, and system-wide invitations.
- **Supervisor**: Manage specific teams, track client attendance, and send invitations.
- **Client**: Real-time geo-fenced check-ins, personal attendance history, and activity heatmaps.

### 📍 Intelligent Geo-Fencing
- **Precise Validation**: Uses Haversine formula to calculate the exact distance from the center of a zone.
- **Accuracy Thresholds**: Blocks attendance marking if GPS accuracy is poor (above 50m) to prevent spoofing.
- **Live Telemetry**: Real-time feedback on distance to the nearest zone and GPS signal strength.

### 📊 Visualization & Analytics
- **Activity Heatmaps**: Visual representation of attendance consistency over the last 30 days.
- **Stat Cards**: Quick-glance metrics for total, successful, and failed scans.
- **Detailed History**: Full audit trail of all attendance attempts with status breakdown.

### 💎 Premium UI/UX
- **Glassmorphism**: Sophisticated blur effects and translucency using `expo-blur`.
- **Responsive Scaling**: Custom scaling engine ensures a consistent look across all screen sizes (phones to tablets).
- **Haptic Feedback**: Tactile responses for critical actions using `expo-haptics`.
- **Dark Mode First**: A sleek, modern dark theme optimized for high-end displays.

---

## 🛠 Tech Stack

- **Core**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs)
- **Icons**: [Lucide React Native](https://lucide.dev/)
- **Location**: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- **Storage**: 
  - `expo-secure-store`: Encrypted storage for authentication tokens.
  - `@react-native-async-storage/async-storage`: Caching and non-sensitive data.
- **Networking**: [Axios](https://axios-http.com/) with automatic token refresh interceptors.
- **Maps**: [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- **Feedback**: `expo-haptics` & `expo-blur`

---

## 📁 Project Structure

```text
mobile/
├── src/
│   ├── api/          # Axios client & role-specific API modules
│   ├── components/   # Reusable UI components (Cards, Gauges, Buttons)
│   ├── context/      # AuthContext & global state providers
│   ├── hooks/        # Custom hooks (useLocation, useGeofence)
│   ├── screens/      # Role-based screen directories (Admin, Supervisor, Client)
│   ├── theme/        # Design system (Colors, Spacing, Typography, Shadows)
│   └── utils/        # Helpers (Haversine logic, Responsive scaling)
├── assets/           # Static assets and splash screens
└── App.tsx           # Entry point & Main Navigation Container
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your physical device or an Android/iOS emulator.

### Installation
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file in the root of the `mobile` directory:
```env
EXPO_PUBLIC_API_URL=http://your-api-url:3000/api
```

### Running the App
- **Start Expo CLI**: `npm start`
- **Run on Android**: `npm run android`
- **Run on iOS**: `npm run ios`

---

## 🔒 Security & Optimization
- **Token Refresh**: Automatic handling of expired access tokens using a silent refresh queue.
- **Offline Ready**: Attendance records are cached locally if a sync fails, ensuring data integrity in low-connectivity areas.
- **Production Clean**: All debug logs and development comments are stripped for the production build.

---

## 🎨 Design System
The app uses a centralized theme engine located in `src/theme/index.ts`:
- **Colors**: Curated palette with vibrant primaries and deep surfaces.
- **Spacing/Radius**: Calculated using `moderateScale` for perfect proportions.
- **Typography**: Scaled via `fontScale` to respect system accessibility settings.

---
© 2026 Geo-Attendance System. Built for high-performance workforce tracking.
