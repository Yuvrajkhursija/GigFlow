# Key Logic Explanation

## Atomic Hiring Transaction

The most critical feature of GigFlow is the atomic hiring process that prevents race conditions when multiple users try to hire simultaneously.

### Implementation Location
`server/routes/bidRoutes.js` - `PATCH /api/bids/:bidId/hire`

### How It Works

1. **Transaction Start**
   ```javascript
   const session = await mongoose.startSession();
   session.startTransaction();
   ```
   - Creates a MongoDB session for transaction management
   - All subsequent operations use this session

2. **Validation Checks (Within Transaction)**
   - Verify bid exists and status is `pending`
   - Verify gig exists and status is `open`
   - Verify user is the gig owner
   - These checks happen atomically - if any fail, the entire transaction is aborted

3. **Atomic Updates**
   ```javascript
   await Gig.updateOne(
     { _id: gig._id, status: 'open' },
     { $set: { status: 'assigned' } },
     { session }
   );
   
   await Bid.updateOne(
     { _id: bidId, status: 'pending' },
     { $set: { status: 'hired' } },
     { session }
   );
   
   await Bid.updateMany(
     { gigId: gig._id, _id: { $ne: bidId }, status: 'pending' },
     { $set: { status: 'rejected' } },
     { session }
   );
   ```
   - All three updates happen atomically
   - The query conditions (`status: 'open'` and `status: 'pending'`) ensure that if another transaction already changed the status, this update will affect 0 documents
   - This prevents double-hiring even if two requests arrive simultaneously

4. **Commit or Rollback**
   ```javascript
   await session.commitTransaction();
   // OR
   await session.abortTransaction();
   ```
   - If all operations succeed, commit the transaction
   - If any operation fails or validation fails, abort and rollback all changes

### Race Condition Prevention

**Scenario**: Two clients try to hire different bids for the same gig simultaneously.

**Without Transactions**: Both might read `gig.status = 'open'`, both might update, resulting in two hired bids.

**With Transactions**:
1. Transaction A reads `gig.status = 'open'` and locks the document
2. Transaction B tries to read but waits for A to complete
3. Transaction A updates `gig.status = 'assigned'` and commits
4. Transaction B reads `gig.status = 'assigned'` and fails the validation check
5. Transaction B aborts

The key is the conditional update: `{ _id: gig._id, status: 'open' }` - if the status changed, the update affects 0 documents, and we detect the failure.

## Real-time Notifications with Socket.io

### Server-Side Implementation

**Location**: `server/routes/bidRoutes.js` (hire endpoint) and `server/socket/socket.js`

1. **Socket Authentication**
   - When a user connects, Socket.io middleware authenticates using JWT from cookies
   - User is joined to a room named after their user ID: `socket.join(socket.userId)`

2. **Notification Emission**
   ```javascript
   req.io.to(bid.freelancerId.toString()).emit('notification', {
     message: `You have been hired for ${gig.title}!`,
     type: 'hired',
   });
   ```
   - When a bid is hired, the server emits to the freelancer's personal room
   - Only that specific user receives the notification

3. **Database Persistence**
   ```javascript
   await Notification.create({
     receiverId: bid.freelancerId,
     message: `You have been hired for ${gig.title}!`,
   });
   ```
   - Notification is also saved to the database for persistence
   - User can view all notifications even if they were offline

### Client-Side Implementation

**Location**: `client/src/App.jsx` and `client/src/utils/socket.js`

1. **Socket Connection**
   ```javascript
   socket = io('http://localhost:5000', {
     withCredentials: true,
   });
   ```
   - Connects when user logs in
   - `withCredentials: true` ensures cookies (JWT) are sent

2. **Notification Listener**
   ```javascript
   socket.on('notification', (data) => {
     toast.success(data.message);
     dispatch(addNotification({...}));
     dispatch(fetchNotifications());
   });
   ```
   - Shows immediate toast notification
   - Updates Redux store
   - Fetches full notification list from server

3. **Cleanup**
   - Socket disconnects when user logs out
   - Event listeners are removed to prevent memory leaks

## Authentication Flow

### JWT in HttpOnly Cookies

**Why HttpOnly?**
- Prevents XSS attacks - JavaScript cannot access the cookie
- More secure than localStorage

**Implementation**:
1. Server sets cookie on login/register:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 30 * 24 * 60 * 60 * 1000,
   });
   ```

2. Client automatically sends cookie with requests (axios withCredentials: true)

3. Server middleware validates cookie:
   ```javascript
   const token = req.cookies.token;
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   ```

### Protected Routes

**Frontend**: `client/src/utils/ProtectedRoute.jsx`
- Checks Redux store for `isAuthenticated`
- Redirects to login if not authenticated

**Backend**: `server/middleware/authMiddleware.js`
- Validates JWT from cookie
- Attaches user to `req.user`
- Returns 401 if invalid/missing token

## Access Control

### Gig Ownership
- Only gig owner can view bids for their gig
- Only gig owner can hire freelancers
- Users cannot bid on their own gigs

### Bid Management
- Only freelancer who placed bid can see it in "My Bids"
- Only gig owner can see all bids for their gig
- Bid status changes are controlled by the hiring process

## Data Flow Example: Hiring Process

1. **Client clicks "Hire" button**
   - Frontend: `client/src/pages/GigDetail.jsx` → `handleHire(bidId)`
   - Dispatches `hireBid(bidId)` action

2. **Redux Action**
   - `client/src/store/slices/bidSlice.js`
   - Makes PATCH request to `/api/bids/:bidId/hire`

3. **Backend Processing**
   - `server/routes/bidRoutes.js`
   - Starts MongoDB transaction
   - Validates all conditions
   - Updates gig and bids atomically
   - Emits Socket.io notification
   - Creates database notification
   - Commits transaction

4. **Real-time Update**
   - Socket.io sends notification to freelancer
   - Freelancer's browser receives notification
   - Toast appears immediately
   - Redux store updates

5. **UI Update**
   - Frontend refetches gig and bids
   - UI shows updated statuses
   - Hired bid shows green, rejected bids show gray

## Error Handling

### Centralized Error Middleware
**Location**: `server/middleware/errorHandler.js`

- Catches all errors from routes
- Formats consistent error responses
- Handles specific error types:
  - Zod validation errors → 400 with field details
  - JWT errors → 401
  - Mongoose errors → 400/404
  - Generic errors → 500

### Frontend Error Handling
- Redux Toolkit automatically handles rejected actions
- Toast notifications show user-friendly error messages
- Loading states prevent duplicate submissions

## Search Functionality

**Backend**: `server/routes/gigRoutes.js`
```javascript
const { search } = req.query;
const query = { status: 'open' };

if (search) {
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];
}
```

- Case-insensitive regex search
- Searches both title and description
- Only searches open gigs

**Frontend**: `client/src/pages/BrowseGigs.jsx`
- Search form with query parameter
- Debounced search (can be improved)
- Updates URL with search term
