# Authentication Implementation Guide

## Overview
The login system has been updated to combine Participant and Volunteer into a single login button. Upon login, the system dynamically determines if a user is a participant or volunteer based on their role stored in the database.

## Changes Made

### 1. Login Page (`app/page.tsx`)
**Key Changes:**
- Combined "Participant" and "Volunteer" into a single "Participant / Volunteer" button
- Removed the separate role selection logic for participants vs volunteers
- Added authentication API call on form submission
- Added loading state with spinner animation
- Added error handling and display
- Disabled inputs and buttons during login process

**New Features:**
- Real-time error messages displayed to the user
- Loading indicator during authentication
- Token storage in localStorage for future requests
- Dynamic routing based on user's actual role from database (PARTICIPANT/VOLUNTEER → `/calendar`, STAFF → `/staff`)

### 2. Authentication Endpoint (`app/api/auth/login/route.ts`)
**New Endpoint:** `POST /api/auth/login`

**Responsibilities:**
1. Receives email, password, role, and optional access code
2. Validates user exists in database
3. Verifies user's role matches what they're attempting to access
4. Validates staff access code if role is staff
5. Returns user role from database for dynamic routing
6. Generates authentication token

**Request Body:**
```json
{
  "email": "user@organization.org",
  "password": "userPassword",
  "role": "participant-volunteer" | "staff",
  "accessCode": "STAFF-2025" // Only required for staff login
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "base64EncodedToken",
  "user": {
    "id": "uuid",
    "email": "user@organization.org",
    "name": "User Name"
  },
  "userRole": "PARTICIPANT" | "VOLUNTEER" | "STAFF"
}
```

**Response (Error):**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Database Schema
The system uses the following user roles from your Prisma schema:
- `PARTICIPANT` - Regular event participants
- `VOLUNTEER` - Event volunteers
- `STAFF` - Staff members managing events

## Implementation Notes

### Security TODOs
The following security implementations should be completed before production:

1. **Password Hashing:**
   - Replace placeholder password validation with `bcrypt` or similar
   - Current code just does string comparison (insecure!)
   - Install: `npm install bcrypt` and `npm install -D @types/bcrypt`
   - Implement proper hashing in both registration and login

2. **JWT Tokens:**
   - Replace the simple base64 token with proper JWT
   - Install: `npm install jsonwebtoken` and `npm install -D @types/jsonwebtoken`
   - Set `JWT_SECRET` environment variable

3. **Staff Access Code:**
   - ✅ Implemented with hardcoded code: `123456`
   - Only users with role `STAFF` can access the staff dashboard
   - Consider adding access code expiration or storing in database for future enhancement

4. **HTTPS Only:**
   - Ensure authentication endpoints only work over HTTPS in production
   - Implement CSRF protection
   - Add rate limiting to prevent brute force attacks

### Environment Variables
Create a `.env.local` file with:
```
STAFF_ACCESS_CODE=your-secure-access-code
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=your-postgresql-connection-string
```

## User Flow

### For Participants/Volunteers:
1. User clicks "Participant / Volunteer" button
2. Enters email and password
3. Click "Continue as Participant / Volunteer"
4. System authenticates via `/api/auth/login`
5. System checks database for user role (PARTICIPANT or VOLUNTEER)
6. Redirects to `/calendar` page
7. User sees calendar with their role-specific content

### For Staff:
1. User clicks "Staff" button
2. Enters email, password, and staff access code
3. Click "Continue as Staff"
4. System authenticates via `/api/auth/login`
5. System validates access code and checks role is STAFF
6. Redirects to `/staff` page
7. User sees staff dashboard with management tools

## Storing Auth Token

The login page automatically stores the auth token in localStorage:
```javascript
localStorage.setItem("authToken", data.token);
```

To use this token in subsequent API requests, add it to the Authorization header:
```javascript
const token = localStorage.getItem("authToken");
const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};
```

## Future Enhancements

1. **Logout Functionality:**
   - Create logout endpoint that invalidates tokens
   - Clear localStorage on logout

2. **Session Management:**
   - Implement token refresh logic
   - Add session timeout
   - Implement "remember me" functionality

3. **Role-Based UI:**
   - Hide/show UI elements based on user role
   - Implement role-based access control for pages and features

4. **Registration:**
   - Create registration page for new participants/volunteers
   - Implement staff invitation system

5. **Account Recovery:**
   - Implement "Forgot Password" functionality
   - Add email verification

## Testing

Test the login flow with sample data:

**Sample Users in Database:**
```
- Email: participant@example.com | Role: PARTICIPANT
- Email: volunteer@example.com | Role: VOLUNTEER  
- Email: staff@example.com | Role: STAFF
```

**Test Cases:**
1. ✓ Login as participant → redirects to /calendar
2. ✓ Login as volunteer → redirects to /calendar
3. ✓ Login as staff (with valid access code) → redirects to /staff
4. ✓ Invalid email → shows error message
5. ✓ Invalid password → shows error message
6. ✓ Staff login without access code → shows error
7. ✓ Staff login with wrong access code → shows error
