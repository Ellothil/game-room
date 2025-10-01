# Profile System

## Overview

The profile system allows users to customize their account with a display name and profile pictures. New users are prompted to complete their profile after their first login.

## Features

### 1. **First-Time Setup**
- After registration or first login, users see a modal to complete their profile
- Users can set a display name (defaults to username if left empty)
- Users can optionally upload a profile picture
- Once completed, the modal won't show again

### 2. **Profile Pictures**
- Upload multiple profile pictures (JPEG, PNG, GIF, WebP)
- Max file size: 5MB per image
- Set any uploaded picture as the current profile picture
- Delete pictures from the database
- Pictures are stored in `server/uploads/profile-pictures/`

### 3. **Display Names**
- Users can choose a display name different from their username
- Display names are shown throughout the app instead of usernames
- Can be changed anytime in account settings

### 4. **Account Settings**
- Access via profile picture button (top right)
- Update display name
- Upload new profile pictures
- Switch between uploaded pictures
- Delete unwanted pictures
- Profile picture button shows current picture or placeholder icon

## Database Schema

### Users Table (Updated)
```sql
- display_name VARCHAR(50)                  -- Custom display name
- current_profile_picture_id UUID           -- Reference to current picture
- profile_completed BOOLEAN DEFAULT FALSE   -- First-time setup status
```

### Profile Pictures Table (New)
```sql
- id UUID PRIMARY KEY
- user_id UUID                              -- Owner of the picture
- file_name VARCHAR(255)                    -- Original filename
- file_path VARCHAR(500)                    -- Server path
- uploaded_at TIMESTAMP                     -- Upload timestamp
```

## API Endpoints

### Profile Setup
- `POST /profile/setup` - Complete first-time profile setup

### Picture Management
- `POST /profile/upload-picture` - Upload a new profile picture
- `GET /profile/pictures/:userId` - Get all pictures for a user
- `POST /profile/set-current-picture` - Set current profile picture
- `DELETE /profile/picture/:pictureId` - Delete a picture

### Name Management
- `POST /profile/update-name` - Update display name
- `GET /profile/:userId` - Get complete user profile

## Migration

If you already have an existing database, run the migration:

```bash
psql -U your_username -d your_database -f server/src/postgres/migration-add-profiles.sql
```

For a fresh database setup, the `init.sql` already includes all profile tables.

## File Structure

```
client/src/
├── components/
│   ├── profile-setup-modal.tsx     # First-time setup modal
│   ├── account-settings.tsx        # Account management modal
│   └── profile-button.tsx          # Profile picture button
├── services/
│   └── profile.ts                  # Profile API service
└── stores/
    └── auth-store.ts               # Updated with profile fields

server/src/
├── endpoints/
│   └── profile.ts                  # Profile endpoints
└── postgres/
    ├── init.sql                    # Complete DB schema
    └── migration-add-profiles.sql  # Migration for existing DBs
```

## Usage

### Client-Side
```typescript
// Get current user profile
const user = useAuthStore((state) => state.user);
const displayName = user?.displayName || user?.username;
const profilePicture = user?.profilePicture;

// Update profile
const updateProfile = useAuthStore((state) => state.updateProfile);
updateProfile({ displayName: "New Name" });
```

### Server-Side
Profile pictures are served as static files from `/uploads/profile-pictures/`

## Security

- File uploads validated (type and size)
- Users can only modify their own profiles
- Profile pictures stored outside web root
- Proper authentication required for all endpoints
