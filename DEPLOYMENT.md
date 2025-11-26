# Deployment Guide - ChronoXP

This guide covers how to build and deploy the ChronoXP application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn or pnpm
- A Firebase project (for authentication and database if using Firestore, though currently using IndexedDB for local-first)

## Environment Setup

1.  Copy `.env.example` to `.env.local` (if it exists, otherwise create it):
    ```bash
    cp .env.example .env.local
    ```

2.  Configure the following environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

## Local Development

To run the application locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `.next` folder with the optimized application.

To start the production server locally:

```bash
npm start
```

## Deploying to Vercel (Recommended)

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Vercel will automatically detect Next.js.
4.  Add your Environment Variables in the Vercel project settings.
5.  Click **Deploy**.

## PWA Support

The application is configured as a Progressive Web App (PWA).
- **Manifest**: Located at `public/manifest.json`.
- **Service Worker**: Located at `public/sw.js`.
- **Icons**: Ensure `public/icon-light-32x32.png` and `public/apple-icon.png` exist.

To test PWA features, build the app and run it in production mode (`npm run build && npm start`), as service workers often don't run in dev mode.

## Troubleshooting

- **Build Errors**: Check for TypeScript errors by running `npm run type-check` (if script exists) or `tsc --noEmit`.
- **Lint Errors**: Run `npm run lint` to identify and fix linting issues.
