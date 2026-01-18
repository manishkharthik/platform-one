# Architecture Diagram: Edit & Delete Events Feature

## 📊 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Staff Dashboard                         │
│                   (page.tsx)                                │
│                                                             │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │  Calendar Grid       │   │  Event List          │       │
│  │  (Component)         │   │  (Component)         │       │
│  │                      │   │                      │       │
│  │  • Shows days        │   │  • Shows events      │       │
│  │  • Click day → set   │   │  • [✎ Edit]   ◄─────┼─ NEW
│  │    selectedDay       │   │  • [🗑 Delete] ◄─────┼─ NEW
│  │                      │   │  • Calls handler     │       │
│  └──────────────────────┘   └──────────────────────┘       │
│           ▲                           ▲                     │
│           │                           │                     │
│           └───────┬───────────────────┘                     │
│                   │                                         │
│          setState(selectedDay)                             │
│          onEditEvent handler ◄─ NEW                        │
│          onDeleteEvent handler ◄─ NEW                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           │                    │
           │                    │
           ▼                    ▼
    ┌─────────────────┐  ┌──────────────────┐
    │  Calendar View  │  │  Event Details   │
    │  Displays:      │  │  Displays:       │
    │  • Month grid   │  │  • Event list    │
    │  • Event count  │  │  • Edit/Delete   │
    │  • Color dots   │  │    buttons       │
    └─────────────────┘  └──────────────────┘
```

---

## 🔄 Edit Event Flow

```
EVENT LIST COMPONENT
    ▼
User clicks [✎ Edit]
    ▼
handleEditClick() fires
    ▼
e.stopPropagation()
    ▼
onEditEvent(eventId, event) callback
    │
    └─→ STAFF PAGE COMPONENT
         │
         └─→ handleEditEvent(eventId, event)
              │
              └─→ router.push(`/staff/create-event?id=${event.dbId}`)
                   │
                   ▼
              CREATE EVENT PAGE
                   │
                   ├─→ useSearchParams() gets ?id=xxx
                   │
                   ├─→ isEditMode = true
                   │
                   ├─→ useEffect runs
                   │
                   ├─→ fetch(`/api/events/${eventId}`)
                   │
                   ├─→ GET /api/events/[id]
                   │
                   ├─→ Response includes:
                   │   • name, start, end, location
                   │   • minTier, capacities
                   │   • questions[]
                   │
                   ├─→ setFormData() populates form
                   │
                   ├─→ User sees:
                   │   • "Update Event" header
                   │   • "Update Event" button
                   │   • All fields pre-filled
                   │
                   ├─→ User modifies fields
                   │
                   ├─→ User clicks "Update Event"
                   │
                   ├─→ handleSubmit() fires
                   │
                   ├─→ Validation checks pass
                   │
                   ├─→ PUT /api/events/{eventId}
                   │
                   ├─→ API updates:
                   │   • Event record
                   │   • Delete old questions
                   │   • Create new questions
                   │
                   ├─→ Response: Updated event
                   │
                   ├─→ router.push("/staff")
                   │
                   └─→ Back to calendar with changes
```

---

## 🗑️ Delete Event Flow

```
EVENT LIST COMPONENT
    ▼
User clicks [🗑 Delete]
    ▼
handleDeleteClick() fires
    ▼
e.stopPropagation()
    ▼
window.confirm() dialog shows
    ▼
"Are you sure you want to delete this event?"
    ▼
    ├─ User clicks CANCEL ─→ Nothing happens
    │
    └─ User clicks OK
         │
         ▼
    onDeleteEvent(eventId) callback
         │
         └─→ STAFF PAGE COMPONENT
              │
              └─→ handleDeleteEvent(eventId)
                   │
                   ├─→ fetch(`/api/events/${eventId}`, {
                   │    method: "DELETE"
                   │   })
                   │
                   ├─→ DELETE /api/events/[id]
                   │
                   ├─→ API cascade deletes:
                   │   1. Bookings (registrations)
                   │   2. Questions
                   │   3. Event
                   │
                   ├─→ Response: Success message
                   │
                   ├─→ Update UI state:
                   │   • Remove from events[]
                   │   • Clear selectedEvent
                   │   • Clear selectedDay
                   │
                   └─→ Event disappears from calendar
```

---

## 📡 API Layer Architecture

```
┌────────────────────────────────────────────────────────────┐
│               API ROUTES                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  GET /api/events                                          │
│  ├─ Fetch all events                                      │
│  └─ Returns: Event[]                                      │
│                                                            │
│  POST /api/events                                         │
│  ├─ Create new event                                      │
│  └─ Returns: Event (created)                              │
│                                                            │
│  GET /api/events/[id]                                     │
│  ├─ Fetch single event with questions                     │
│  └─ Returns: Event (with questions)                       │
│                                                            │
│  PUT /api/events/[id]  ◄─── NEW                           │
│  ├─ Update existing event                                 │
│  ├─ Handles: Basic fields + Questions                     │
│  ├─ Validation: name, start, end, location               │
│  ├─ Steps:                                                │
│  │  1. Update event record                                │
│  │  2. Delete old questions                               │
│  │  3. Create new questions                               │
│  ├─ Returns: Updated Event (with questions)               │
│  └─ Errors: 400, 404, 500                                │
│                                                            │
│  DELETE /api/events/[id]  ◄─── NEW                        │
│  ├─ Delete existing event                                 │
│  ├─ Cascade delete logic:                                 │
│  │  1. Find event (verify exists)                         │
│  │  2. Delete all bookings                                │
│  │  3. Delete all questions                               │
│  │  4. Delete event                                       │
│  ├─ Returns: Success message                              │
│  └─ Errors: 404, 500                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Operation Flow

### UPDATE (PUT) Flow
```
Request arrives with event ID and new data
    ▼
Validate required fields
    ▼
Transaction start
    ▼
UPDATE event table
    • SET name, start, end, location, etc.
    • WHERE id = eventId
    ▼
DELETE FROM questions WHERE eventId = ?
    ▼
INSERT new questions
    • For each question in request
    ▼
SELECT updated event with questions
    ▼
Return to client
```

### DELETE Flow
```
Request arrives with event ID
    ▼
Check event exists
    ├─ Not found? Return 404
    └─ Found? Continue
         ▼
    Transaction start
         ▼
    DELETE FROM bookings WHERE eventId = ?
         • Cascade delete related answers
         ▼
    DELETE FROM questions WHERE eventId = ?
         • Cascade delete related answers
         ▼
    DELETE FROM events WHERE id = ?
         ▼
    Transaction commit
         ▼
    Return success to client
         ▼
    Client updates local state
         ▼
    UI re-renders without deleted event
```

---

## 🎨 UI State Management

```
Staff Page State
│
├─ currentDate: Date
├─ selectedDay: number | null
├─ selectedEvent: string | null
├─ events: Event[]  ◄─ Updated on delete
├─ attendees: Attendee[]
│
└─ Handlers:
   ├─ handleDayClick()
   ├─ handleEditEvent() ◄─ NEW
   │  └─ Navigates to edit form
   │
   ├─ handleDeleteEvent() ◄─ NEW
   │  └─ API call + state update
   │
   └─ ... other handlers

Event List Props
├─ events: Event[]
├─ categories: Category[]
├─ selectedDay: number | null
├─ monthName: string
├─ selectedEvent: string | null
├─ onEventSelect: (id) => void
├─ onEditEvent: (id, event) => void ◄─ NEW
└─ onDeleteEvent: (id) => void ◄─ NEW
```

---

## 🔐 Permission & Validation

```
User Action
    ▼
Check: User logged in as STAFF?
    ├─ No → Redirect to login
    └─ Yes → Continue
         ▼
    Button visible in EventList
         ▼
    User clicks button
         ▼
    Client-side validation
         ├─ Form fields complete? (for edit)
         └─ Continue
         ▼
    API call sent
         ▼
    Server-side validation
         ├─ Event exists?
         ├─ Required fields present? (for edit)
         └─ Continue
         ▼
    Operation executes
         ▼
    Response to client
         ▼
    UI updates
```

---

## 📈 Data Flow Diagram

```
                    FRONTEND                    │  BACKEND
                                                │
EventList (Event[]) ─────┬──────────────────────┼────► Database
                         │                      │       (Prisma)
                         │                      │
                    [✎] [🗑] buttons            │
                         │                      │
                    User clicks                 │
                         │                      │
    ┌────────────────────┴────────────────┐    │
    ▼                                     ▼    │
handleEditClick()              handleDeleteClick()
    │                                     │    │
    ├──→ Event ID                         ├──→ Confirm dialog
    │    + Event Data                     │    
    │                                     └──→ Event ID
    │                                          │
    └──────────┬─────────────────┬─────────────┘
               │                 │
        PUT request         DELETE request
        /api/events/[id]   /api/events/[id]
               │                 │
               ▼                 ▼
         Updated fields      Cascade delete
         + Questions         • Bookings
                            • Questions
                            • Event
               │                 │
               └────────┬─────────┘
                        ▼
                  Update UI state
                        │
                        ▼
                  Re-render component
```

---

## 🔄 Component Re-render Flow

```
Delete Event Clicked
    ▼
DELETE /api/events/{id} success
    ▼
setEvents(events.filter(e => e.dbId !== eventId))
    ▼
React detects state change
    ▼
Staff Page re-renders
    ▼
CalendarGrid receives new events prop
    ├─→ Re-renders with removed event
    └─→ Calendar updates immediately
    ▼
EventList receives empty events array
    ├─→ Re-renders without deleted event
    └─→ "No events for this day" shown
```

---

## 🎯 Summary

**New Features Added:**
1. ✅ Edit button in EventList
2. ✅ Delete button in EventList  
3. ✅ PUT endpoint in API
4. ✅ DELETE endpoint in API
5. ✅ Edit mode in CreateEventPage
6. ✅ Event handlers in Staff page
7. ✅ Confirmation dialog
8. ✅ Pre-population logic

**Data Flow:**
- User clicks button → Handler called → API request → Database updated → UI refreshed

**Error Handling:**
- Validation errors → User feedback
- Network errors → Alert message
- Permission errors → Redirect

