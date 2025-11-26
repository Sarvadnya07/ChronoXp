# ChronoXP

A gamified, cross-platform productivity operating system designed to turn your daily routine into an RPG game.

## Features

### 🎮 Gamification System
- **XP & Levels**: Earn XP for every productive task. Level up every 1000 XP.
- **Streaks**: Maintain streaks by completing core daily habits.
- **Badges**: Unlock special achievements for consistency and milestones.
- **Visual Rewards**: Glowing UI elements and progress bars.

### 📅 Productivity Tools
- **Timeline View**: Visual day planner to see your schedule at a glance.
- **Task Manager**: Categorized tasks with difficulty ratings and duration tracking.
- **Daily Journal**: Track your mood and reflections with tags.
- **Analytics**: Beautiful charts showing your XP growth, category breakdown, and productivity index.

### 🏗 Technical Features
- **PWA Support**: Installable on mobile and desktop.
- **Offline First**: Works completely offline using IndexedDB.
- **Local Notifications**: Smart reminders for your scheduled tasks.
- **Cyber Aesthetic**: Modern dark mode UI with neon accents.

## Setup & Installation

### Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

### Building for Production
1. Build the app: `npm run build`
2. Start production server: `npm start`

### PWA Installation
- **Mobile (iOS)**: Open in Safari -> Share -> Add to Home Screen
- **Mobile (Android)**: Open in Chrome -> Install App
- **Desktop**: Click the install icon in the address bar

## Cloud Sync (Optional)
To enable cloud sync, you need to configure Firebase:
1. Create a Firebase project
2. Enable Firestore Database
3. Add your Firebase config to `lib/firebase.ts` (create this file)
4. Enable cloud sync in the Settings tab

## Technologies Used
- Next.js 14 (App Router)
- React & TypeScript
- TailwindCSS (v4)
- Zustand (State Management)
- IndexedDB (Local Storage)
- Recharts (Analytics)
- Lucide React (Icons)
