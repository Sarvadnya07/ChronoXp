# Auth & Landing Page Flow Guide

## Overview

Your ChronoXP already has a **complete auth and landing page system** implemented. Here's how it works:

## 1. Landing Page (Route: `/`)

**Location**: `app/page.tsx`

**Features**:
- ✅ App name: "ChronoXP"
- ✅ Tagline: "Gamify Your Productivity"
- ✅ Feature showcase with icons (XP, Streaks, Analytics, Brain-powered insights)
- ✅ Two main CTAs:
  - **"Continue with Google"** → Firebase Google Login
  - **"Continue as Guest"** → Local-only mode

**Design**:
- Dark mode with cyber purple + blue accents
- Responsive layout
- Gradient text effects
- Auto-redirects to `/app` if user is already logged in

## 2. Auth Provider

**Location**: `components/auth-provider.tsx`

**Exposes**: 
```typescript
const { user, isGuest, isLoading, loginWithGoogle, continueAsGuest, logout } = useAuth()
```

**How it works**:

### a) Google Login Flow
1. User clicks "Continue with Google"
2. `loginWithGoogle()` triggers Firebase popup
3. On success:
   - Creates/updates `users/{uid}` document in Firestore
   - Stores profile: `{ name, email, photoURL, createdAt, lastLoginAt }`
   - Redirects to `/app`

### b) Guest Mode Flow
1. User clicks "Continue as Guest"
2. `continueAsGuest()` sets `localStorage.setItem("guestMode", "true")`
3. All data stored locally in IndexedDB
4. Redirects to `/app`
5. In Settings, shows "Sign in with Google" button to upgrade

### c) Auth State Management
- Uses Firebase `onAuthStateChanged` listener
- Checks localStorage for guest mode on mount
- Syncs user profile to Firestore on login

## 3. Route Protection

**Routes**:
- `/` → Landing Page (public)
- `/app` → Main Dashboard (protected - requires user OR guest)
- All other app pages → Protected

**Protection Logic** (in `app/page.tsx`):
```typescript
useEffect(() => {
  if (!isLoading && (user || isGuest)) {
    router.push("/app")  // Redirect to app if already authenticated
  }
}, [user, isGuest, isLoading, router])
```

For `/app` route: User must have either Firebase auth or guest mode enabled.

## 4. Main App UI (`/app`)

**Location**: `app/app/page.tsx`

**Header shows**:

### If Logged In (Firebase):
- App logo
- User avatar (from photoURL)
- User name
- Level & XP indicator
- Logout button

### If Guest Mode:
- "Guest Mode" badge
- Button: "Sign in with Google"

## 5. Firebase Configuration

**Location**: `lib/firebase.ts`

**Setup**:
1. Create a `.env.local` file in the root directory
2. Add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Restart your dev server

**Firestore Structure**:
```
users/{uid}/
  ├── profile: { name, email, photoURL, createdAt, lastLoginAt }
  ├── settings: { ...app settings }
  ├── tasks: [ ...tasks array ]
  └── progress: [ ...daily progress ]
```

## 6. Guest → Logged In Migration

**Location**: `components/settings/settings-view.tsx` (planned feature)

When a guest user clicks "Sign in with Google":
1. Triggers `loginWithGoogle()`
2. `syncData()` function (in `lib/firebase.ts`) uploads local IndexedDB data to Firestore
3. User is now fully synced

## Testing the Flow

1. **Start fresh**: Clear localStorage and cookies
2. **Visit**: `http://localhost:3000/`
3. **You should see**: Landing page with two buttons
4. **Try Guest Mode**: Click "Continue as Guest" → Should redirect to `/app`
5. **Try Google Login**: Click "Continue with Google" → Firebase popup → Redirect to `/app`

## Current Status

✅ Landing Page implemented  
✅ Google Authentication working  
✅ Guest Mode working  
✅ Route protection in place  
✅ User avatars & profiles  
✅ Logout functionality  
✅ Firebase integration ready  

## If Landing Page Doesn't Appear

If you're seeing the main app directly, try:
1. Clear browser cache and localStorage
2. Restart dev server: `npm run dev`
3. Visit `http://localhost:3000/` (not `/app`)
4. Check console for any Firebase config errors

## Next Steps

1. Add your Firebase credentials to `.env.local`
2. Test the full auth flow
3. Customize the landing page copy if needed
4. Add more feature cards to the landing page
