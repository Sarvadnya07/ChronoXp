# ⚔️ ChronoXP — The Gamified Productivity OS

**ChronoXP** is a high-performance, cross-platform productivity ecosystem that transforms your daily grind into an epic RPG adventure. Stop managing tasks—start completing quests, earning XP, and leveling up your real life.

Built with a "Cyber-Aesthetic" design, it combines deep productivity analytics with the dopamine-driven feedback loops of modern gaming.

---

## 📸 Interface Preview

> *(Add your screenshots to `/public/screenshots` and update the paths)*

| Quest Dashboard | XP Analytics | Timeline View |
| :--- | :--- | :--- |
| ![Dashboard](./screenshots/dashboard.png) | ![Analytics](./screenshots/stats.png) | ![Timeline](./screenshots/timeline.png) |

---

## 🌟 Key Features

### 🎮 RPG Progression Engine
* **XP & Leveling:** Every completed task grants Experience Points. Watch your level rise as you conquer your to-do list.
* **Streak Multipliers:** Maintain consistency to build "Combo Streaks" and boost your XP gains.
* **Achievements & Badges:** Unlock rare digital trophies for long-term consistency and major milestones.
* **Immersive UI:** A neon-infused, "Cyberpunk" dark mode with glowing progress bars and haptic feedback.

### 📅 Advanced Productivity Suite
* **Visual Timeline:** A vertical day-planner to visualize your schedule and eliminate time-blindness.
* **Difficulty-Weighted Tasks:** Assign "Quest Ranks" (Easy to Epic) to tasks; harder tasks yield higher rewards.
* **Mood Journaling:** Track mental health alongside productivity with tagged reflections.
* **Deep Analytics:** Comprehensive charts powered by **Recharts** to track your productivity index and category distribution.

### 🏗️ Technical Excellence
* **Installable PWA:** Full mobile and desktop support with a "native feel."
* **Offline-First:** All data is stored locally via **IndexedDB**, ensuring zero latency and privacy by default.
* **Smart Reminders:** Local browser notifications that respect your focus hours.
* **Cloud Sync:** Optional Firebase integration for cross-device progression.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **State Management:** Zustand
* **Database:** IndexedDB (Local) / Firestore (Cloud Sync)
* **Data Viz:** Recharts
* **Icons:** Lucide React

---

## ⚙️ Setup & Installation

### 1. Development Environment
```bash
# Clone the repository
git clone [https://github.com/your-username/chronoxp.git](https://github.com/your-username/chronoxp.git)
cd chronoxp

# Install dependencies
npm install

# Start the dev server
npm run dev

2. PWA Installation
Desktop: Click the Install icon in the Chrome/Edge address bar.

iOS: Open in Safari → Tap Share → Select Add to Home Screen.

Android: Open in Chrome → Tap the three dots → Select Install App.

3. Cloud Sync Configuration (Optional)
To enable cross-device syncing, create a lib/firebase.ts file and add your credentials:

TypeScript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};
📂 Project Structure
Plaintext
chronoxp/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   ├── components/         # UI Components (Cards, Gauges, Timelines)
│   ├── hooks/              # useGameLogic, useLocalStorage
│   ├── store/              # Zustand Store for XP and Stats
│   ├── lib/                # Firebase & IndexedDB logic
│   └── types/              # TypeScript Interfaces (Task, User, Quest)
├── public/                 # PWA Icons & Static Assets
└── tailwind.config.ts      # Custom Neon Theme Presets
🎯 Future Roadmap
[ ] Guild System: Join squads with friends for cooperative productivity challenges.

[ ] Avatar Customization: Spend "earned" currency on digital gear and skins.

[ ] AI Quest Master: Automated task prioritization based on your peak energy levels.

[ ] External Integrations: Sync tasks from Google Calendar and GitHub.

📜 License
Distributed under the MIT License. See LICENSE for more information.

Author: Sarvadnya
