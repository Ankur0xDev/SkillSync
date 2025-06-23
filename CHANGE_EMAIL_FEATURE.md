# Change Email Feature Implementation

## Overview
This feature allows users to change their email address, but only if their current email is verified. This ensures security and prevents unauthorized email changes.

## Frontend Implementation (React/TypeScript)

### New State Variables Added:
- `showChangeEmail`: Controls the visibility of the change email form
- `changeEmailData`: Stores the new email and OTP for change email flow
- `changeEmailStep`: Tracks the current step in the change email process ('initial', 'otp-sent', 'confirming')
- `emailMode`: Distinguishes between 'verify' and 'change' email modes

### New Functions Added:
1. **`handleChangeEmail()`**: Initiates the change email process
   - Checks if current email is verified
   - Sets up the change email form
   - Resets state variables

2. **`handleConfirmChangeEmail()`**: Confirms the email change with OTP
   - Validates 6-digit OTP
   - Sends request to backend to change email
   - Updates user state on success

3. **`handleCancelChangeEmail()`**: Cancels the change email process
   - Resets all state variables
   - Returns to normal email verification mode

### UI Changes:
- Updated email verification section to show "Change Email" button for verified users
- Added multi-step change email form with:
  - New email input field
  - OTP verification step
  - Loading states and error handling
- Proper validation and user feedback

## Backend Implementation (Node.js/Express)

### New Routes Added:

#### 1. `POST /users/send-change-email-otp`
**Purpose**: Sends OTP to the new email address for verification

**Validation**:
- Requires authentication
- Validates email format
- Ensures current email is verified
- Checks that new email is different from current
- Verifies new email is not already in use

**Process**:
- Generates 6-digit OTP
- Stores OTP in PendingUser collection with 10-minute expiration
- Sends email with OTP to new email address

#### 2. `PUT /users/change-email`
**Purpose**: Confirms email change with OTP verification

**Validation**:
- Requires authentication
- Validates email format and 6-digit OTP
- Ensures current email is verified
- Verifies OTP is valid and not expired

**Process**:
- Validates OTP against PendingUser collection
- Updates user's email address
- Removes pending verification record
- Returns updated user data

## Security Features

1. **Email Verification Requirement**: Users must verify their current email before changing it
2. **OTP Verification**: 6-digit OTP sent to new email address
3. **Time-limited OTP**: OTP expires after 10 minutes
4. **Duplicate Email Check**: Prevents using email already registered by another user
5. **Authentication Required**: All change email operations require user authentication

## User Flow

1. **Verified User**: Sees "Change Email" button instead of "Verify Email"
2. **Click Change Email**: Opens form to enter new email address
3. **Enter New Email**: User enters desired new email address
4. **Send Verification**: System sends OTP to new email address
5. **Enter OTP**: User enters 6-digit code received via email
6. **Confirm Change**: System updates email and shows success message

## Error Handling

- Invalid email format
- Email already in use
- Current email not verified
- Invalid or expired OTP
- Network/server errors
- User not found

## Files Modified

### Frontend:
- `client/src/components/Settings.tsx`: Main implementation of change email UI and logic

### Backend:
- `server/Routes/users.js`: Added new routes for change email functionality

## Testing

To test the feature:

1. **Start the server**: `cd server && npm start`
2. **Start the client**: `cd client && npm run dev`
3. **Login with a verified account**
4. **Navigate to Settings → Account tab**
5. **Click "Change Email" button**
6. **Follow the email change flow**

## Dependencies

- Frontend: React, TypeScript, Axios, React Hot Toast, Framer Motion
- Backend: Express, Nodemailer, MongoDB, Express Validator 