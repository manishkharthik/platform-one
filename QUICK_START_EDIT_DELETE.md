# Quick Start Guide: Edit & Delete Events

## 🚀 How to Use

### Editing an Event

1. **Navigate to Staff Dashboard** → `/staff`
2. **Click a date** on the calendar
3. **See events for that day** on the right panel
4. **Click the blue pencil icon** ✎ on any event
5. **Form pre-fills** with all event details
6. **Make your changes**
7. **Click "Update Event"** button
8. **Done!** Changes are saved

**Form Header Shows**: "Update Event" (not "Create New Event")

---

### Deleting an Event

1. **Navigate to Staff Dashboard** → `/staff`
2. **Click a date** on the calendar
3. **See events for that day** on the right panel
4. **Click the red trash icon** 🗑 on any event
5. **Confirm deletion** when prompted
6. **Done!** Event and all related data removed

**What Gets Deleted**:
- The event itself
- All bookings/registrations for that event
- All questions for that event

---

## 📍 UI Locations

### Calendar View
```
┌─ Calendar (left)           ┌─ Events (right)
│                            │
│  [Jan] [Feb] [Mar]         │  Events on January 15
│  1  2  3  4               │  ┌─────────────────────┐
│  5  6  7  8 ← Click here   │  │ Workshop Title ✎ 🗑 │
│                            │  │ Badge               │
│                            │  │ 🕐 09:00 AM        │
│                            │  │ 📍 Location Name   │
│                            │  └─────────────────────┘
```

---

## 🎯 Button Locations

### In Event Card
```
Event Title  ← Can click to select event
↑
All event details
  🕐 Time
  📍 Location
  👥 Capacity info
  
  [✎ Edit] [🗑 Delete]
   ↑       ↑
   Blue    Red
   Pencil  Trash
```

---

## ⚠️ Important Notes

- **Edit requires permission**: Only STAFF users can edit/delete
- **Confirmation dialog**: Delete action shows confirmation first
- **Pre-filled form**: All fields auto-populate when editing
- **Button colors**: Edit=Blue, Delete=Red (consistent with status)
- **Error handling**: Errors show alert message to user

---

## 🔄 Form Field Mapping

When editing, these fields are pre-populated from the database:

| Form Field | From Database |
|-----------|--------------|
| Event Name | `event.name` |
| Start Date | `event.start` (formatted) |
| Start Time | `event.start` (time part) |
| End Date | `event.end` (formatted) |
| End Time | `event.end` (time part) |
| Location | `event.location` |
| Min Tier | `event.minTier` |
| Participant Capacity | `event.participantCapacity` |
| Volunteer Capacity | `event.volunteerCapacity` |
| Questions | `event.questions[]` |

---

## 🔍 Debugging

### Edit button not working?
- Make sure you're logged in as STAFF
- Check browser console for errors (F12 → Console tab)
- Verify event has valid database ID (`dbId`)

### Delete not working?
- Confirm deletion when dialog appears
- Check browser console for errors
- Verify you have STAFF permissions

### Form not pre-filling?
- Check browser network tab (F12 → Network)
- Verify `/api/events/{id}` returns data
- Look for error messages on page

---

## 📞 Support

If something doesn't work:
1. Check browser console (F12)
2. Look at network requests (F12 → Network)
3. Verify user role is STAFF
4. Try refreshing the page

---

## ✅ What Works

- ✅ Edit all event details
- ✅ Update event questions
- ✅ Delete event safely (cascade delete)
- ✅ Confirmation before delete
- ✅ Pre-populated forms
- ✅ Real-time UI updates
- ✅ Error handling with feedback

---

## 📱 Keyboard Shortcuts

Currently no keyboard shortcuts. Planned for future:
- `E` - Edit selected event
- `D` - Delete selected event
- `Escape` - Cancel operation

