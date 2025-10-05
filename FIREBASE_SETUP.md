# Firebase Setup Guide for Midnight Soldiers Gallery

## Overview

This document provides instructions for setting up Firebase for the Midnight Soldiers Gallery project.

## Required Firebase Services

- **Authentication**: Admin login system
- **Firestore Database**: Store artist data, subscriptions, and contact forms
- **Storage**: Store artist photos and artwork images

## Firebase Configuration Setup

1. The Firebase credentials are stored in `src/secrets.js`. This file contains:

```javascript
export const apiKey = "your-api-key-here";
export const authDomain = "your-project-id.firebaseapp.com";
export const projectId = "your-project-id";
export const storageBucket = "your-project-id.appspot.com";
export const messagingSenderId = "your-sender-id";
export const appId = "your-app-id";
```

2. Update the values in `src/secrets.js` with your Firebase project credentials from the Firebase Console.

## Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "midnight-soldiers-gallery"
4. Enable Google Analytics (optional)

### 2. Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Create your first admin user:
   - Email: admin@midnightsoldiers.com
   - Password: [secure password]

### 3. Setup Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select your preferred location

### 4. Setup Storage

1. Go to Storage
2. Click "Get started"
3. Start in test mode
4. Choose same location as Firestore

## Firestore Security Rules

Apply these security rules in the Firebase Console under Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write artists
    match /artists/{document} {
      allow read: if true; // Public read access for displaying artists
      allow write: if request.auth != null; // Only authenticated users can write
    }

    // Allow anyone to write subscriptions (public forms)
    // Only authenticated users can read
    match /subscriptions/{document} {
      allow read: if request.auth != null;
      allow write: if true;
    }

    // Allow anyone to write contact forms (public forms)
    // Only authenticated users can read
    match /contact_forms/{document} {
      allow read: if request.auth != null;
      allow write: if true;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Security Rules

Apply these security rules in the Firebase Console under Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload to artists folder
    match /artists/{allPaths=**} {
      allow read: if true; // Public read access for displaying images
      allow write: if request.auth != null; // Only authenticated users can upload
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Collections Structure

### Artists Collection (`artists`)

```javascript
{
  artistName: string,
  artistBio: string,
  artistPhotoUrl: string | null,
  exhibitionName: string,
  exhibitionStartDate: string,
  exhibitionEndDate: string,
  exemplaryWorksUrls: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Subscriptions Collection (`subscriptions`)

```javascript
{
  // For full subscriptions
  firstName: string,
  lastName: string,
  email: string,
  streetAddress: string,
  streetAddress2: string,
  city: string,
  state: string,
  telephone: string,
  type: "full_subscription",
  createdAt: timestamp
}

// OR for newsletter only
{
  email: string,
  type: "newsletter_only",
  createdAt: timestamp
}
```

### Contact Forms Collection (`contact_forms`)

```javascript
{
  name: string,
  email: string,
  subject: string,
  message: string,
  status: "unread",
  createdAt: timestamp
}
```

## Admin Access

### Login Credentials

- URL: `/adminlogin`
- Use the email/password you created in Firebase Authentication

### Admin Routes

- `/admin` - Dashboard overview
- `/artistinfo` - Add new artist form

## Deployment Notes

### Configuration for Production

Make sure your `src/secrets.js` file contains the correct Firebase configuration for your production environment.

### Build Command

```bash
npm run build
```

The build process will compile the application with the Firebase configuration from `src/secrets.js`.

## Troubleshooting

### Common Issues

1. **"Missing Firebase config"**

   - Check that `src/secrets.js` exists and contains all required exports
   - Ensure all values in the secrets file are properly set

2. **"Permission denied" errors**

   - Check Firestore security rules
   - Ensure user is authenticated for protected operations

3. **Image upload failures**

   - Check Storage security rules
   - Verify file size limits (Firebase has 10MB limit by default)

4. **Authentication not working**
   - Verify email/password provider is enabled
   - Check that admin user exists in Authentication tab

### Getting Help

- Check browser console for detailed error messages
- Review Firebase Console logs
- Ensure all Firebase services are enabled in your project
