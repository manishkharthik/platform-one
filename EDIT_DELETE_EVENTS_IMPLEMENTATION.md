# Edit and Delete Events Implementation

## Overview
Successfully implemented the ability for staff to edit and delete existing events from the calendar view. When users click on a day, they can see events on the right side with edit and delete options available.

## Changes Made

### 1. **EventList Component** (`app/staff/components/EventList.tsx`)
- Added `Edit2` and `Trash2` icons from lucide-react
- Added two new props:
  - `onEditEvent?: (eventId: string, event: Event) => void`
  - `onDeleteEvent?: (eventId: string) => void`
- Added edit and delete buttons to each event card with:
  - **Edit Button**: Blue pencil icon that navigates to edit form
  - **Delete Button**: Red trash icon with confirmation dialog
- Buttons use `stopPropagation()` to prevent triggering event selection
- Delete button shows a confirmation dialog: "Are you sure you want to delete this event?"

### 2. **API Route** (`app/api/events/[id]/route.ts`)
Added two new HTTP methods to the existing event route:

#### **PUT Method (Update Event)**
- Updates event details (name, start, end, location, minTier, capacities)
- Deletes old questions and creates new ones
- Requires: name, start, end, location (validation)
- Returns: Updated event with questions
- Status: 200 on success, 400 on validation error, 500 on server error

#### **DELETE Method (Delete Event)**
- Safely deletes event including:
  1. Cascade delete all bookings for the event
  2. Delete all questions associated with the event
  3. Delete the event itself
- Handles foreign key constraints properly
- Returns: Success message
- Status: 200 on success, 404 if event not found, 500 on server error

### 3. **Create Event Page** (`app/staff/create-event/page.tsx`)
Enhanced to support both create and update modes:

#### **Edit Mode Detection**
- Uses `useSearchParams()` to check for `?id=<eventId>` query parameter
- `isEditMode = !!eventId` determines if editing or creating

#### **Pre-population on Edit**
- New `useEffect` loads event data when in edit mode
- Parses database event into form fields:
  - Date/time formatting (ISO string → YYYY-MM-DD and HH:MM)
  - Questions with all properties preserved
  - All capacity and tier settings
- Handles loading state during data fetch

#### **Dynamic UI**
- Header changes: "Create New Event" → "Update Event"
- Submit button text: "Create Event" → "Update Event"
- Submit button loading state: "Creating..." → "Updating..."

#### **API Request**
- Detects mode and uses:
  - Create: `POST /api/events`
  - Update: `PUT /api/events/{id}`

### 4. **Staff Page** (`app/staff/page.tsx`)
Added event management handlers:

#### **`handleEditEvent` Function**
- Receives eventId and event object
- Navigates to `/staff/create-event?id={event.dbId}`
- Pre-populated form loads event data

#### **`handleDeleteEvent` Function**
- Async function that calls `DELETE /api/events/{eventId}`
- On success: Removes event from state and clears selections
- On error: Shows alert with error message
- Updates UI immediately

#### **EventList Props**
- Passes both handlers to EventList component
- Enables edit/delete functionality in calendar view

## User Flow

### Editing an Event
1. User clicks on a day in calendar → sees events for that day
2. User clicks the **blue edit icon** on an event
3. Redirected to `/staff/create-event?id=<eventId>`
4. Form pre-populates with all event details
5. User modifies fields as needed
6. Clicks "Update Event" button
7. Changes saved to database
8. Redirected back to staff page

### Deleting an Event
1. User clicks on a day in calendar → sees events for that day
2. User clicks the **red delete icon** on an event
3. Browser shows confirmation: "Are you sure you want to delete this event?"
4. If confirmed:
   - All bookings for the event are deleted
   - All questions for the event are deleted
   - Event is deleted
   - UI updates immediately
5. If cancelled: Nothing happens

## Key Features

✅ **Edit Functionality**
- Pre-populates all event fields
- Maintains question format and options
- Preserves all event metadata
- Clear UI distinction (shows "Update" instead of "Create")

✅ **Delete Functionality**
- Confirmation dialog prevents accidental deletion
- Cascade delete handles all related data
- Immediate UI update
- Error handling with user feedback

✅ **User Experience**
- Edit/delete buttons visible in calendar event list
- Intuitive icons (pencil for edit, trash for delete)
- Hover effects on buttons for visual feedback
- Clear button titles (tooltips)
- Error alerts for failed operations

✅ **Data Integrity**
- Proper handling of foreign key constraints
- Questions and bookings cleaned up on delete
- Form validation on update
- Proper error responses from API

## Files Modified

1. `app/staff/components/EventList.tsx` - Added edit/delete UI
2. `app/api/events/[id]/route.ts` - Added PUT and DELETE endpoints
3. `app/staff/create-event/page.tsx` - Added edit mode support
4. `app/staff/page.tsx` - Added edit/delete handlers

## Testing Recommendations

1. **Edit Event**
   - Click edit on any event
   - Verify all fields are pre-populated correctly
   - Modify a field
   - Submit and verify changes saved
   - Check form shows "Update Event" header

2. **Delete Event**
   - Click delete on any event
   - Verify confirmation dialog appears
   - Test cancel → event remains
   - Test confirm → event is removed
   - Verify attendees are also removed (check database)

3. **Edge Cases**
   - Edit event with multiple questions
   - Edit event with full capacity
   - Delete event with many bookings
   - Try to edit/delete with no permissions (should fail)

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/events` | Fetch all events |
| POST | `/api/events` | Create new event |
| GET | `/api/events/{id}` | Get event details |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
