# GigFlow - Freelance Marketplace

A complete production-ready MERN stack web application for a mini freelance marketplace where clients can post gigs and freelancers can place bids.

## Features

- **Secure Authentication**: JWT-based auth with HttpOnly cookies
- **Gig Management**: Create, browse, and search gigs
- **Bidding System**: Freelancers can bid on open gigs
- **Atomic Hiring**: Race-condition safe hiring with MongoDB transactions
- **Real-time Notifications**: Socket.io powered instant notifications
- **Dashboard**: Manage posted gigs, bids, and notifications
- **Modern UI**: Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation
- Socket.io Client for real-time updates
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication with HttpOnly cookies
- Socket.io for real-time communication
- Zod for validation
- Bcrypt for password hashing

## Project Structure

```
GigFlow/
├── server/                 # Backend Express application
│   ├── models/            # MongoDB models (User, Gig, Bid, Notification)
│   ├── routes/            # API route handlers
│   ├── middleware/        # Auth and error middleware
│   ├── utils/             # Utility functions (token generation, validation)
│   ├── socket/            # Socket.io configuration
│   └── server.js          # Express server entry point
│
└── client/                # Frontend React application
    ├── src/
    │   ├── components/    # Reusable React components
    │   ├── pages/         # Page components
    │   ├── store/         # Redux store and slices
    │   ├── utils/         # Utility functions (socket, protected routes)
    │   └── App.jsx        # Main app component
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory with the following content:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Note**: Make sure to change `JWT_SECRET` to a strong random string in production!

5. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory (in a new terminal):
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Gigs
- `GET /api/gigs?search=` - Get all open gigs (with optional search)
- `POST /api/gigs` - Create a new gig (protected)
- `GET /api/gigs/:gigId` - Get a single gig
- `GET /api/gigs/mine` - Get current user's posted gigs (protected)

### Bids
- `POST /api/bids` - Create a bid (protected)
- `GET /api/bids/:gigId` - Get bids for a gig (owner only, protected)
- `GET /api/bids/mine` - Get current user's bids (protected)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (atomic, protected)

### Notifications
- `GET /api/notifications` - Get user's notifications (protected)
- `PATCH /api/notifications/:id/read` - Mark notification as read (protected)

## Key Features Explained

### Atomic Hiring Logic

The hiring process uses MongoDB transactions to ensure atomicity and prevent race conditions:

1. **Transaction Start**: A MongoDB session is started with `startTransaction()`
2. **Validation**: Checks are performed within the transaction:
   - Bid exists and is pending
   - Gig exists and is open
   - User is the gig owner
3. **Atomic Updates**: All updates happen atomically:
   - Gig status → `assigned`
   - Chosen bid status → `hired`
   - All other bids for the gig → `rejected`
4. **Commit**: If all checks pass, the transaction is committed
5. **Rollback**: If any check fails, the transaction is aborted

This ensures that even if two users try to hire simultaneously, only one will succeed.

### Real-time Notifications

Socket.io is used for real-time notifications:

1. **Server-side**: When a bid is hired, the server emits a notification to the hired freelancer's room
2. **Client-side**: The React app listens for notifications and:
   - Shows a toast notification
   - Updates the Redux store
   - Updates the notification count in the UI

### Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT in HttpOnly Cookies**: Prevents XSS attacks
- **Protected Routes**: Middleware checks authentication
- **Access Control**: Users can only view/edit their own resources
- **Input Validation**: Zod schemas validate all inputs

## Usage

1. **Register/Login**: Create an account or login
2. **Browse Gigs**: View all open gigs on the homepage
3. **Search**: Use the search bar to find specific gigs
4. **Post a Gig**: Click "Post Gig" to create a new gig (as a client)
5. **Place a Bid**: View gig details and submit a bid (as a freelancer)
6. **Hire Freelancer**: As a gig owner, view bids and hire one (as a client)
7. **Dashboard**: View your posted gigs, bids, and notifications

## Development

### Backend Development
- Server uses `--watch` flag for auto-reload
- MongoDB connection is handled automatically
- Socket.io server runs on the same port as Express

### Frontend Development
- Vite provides hot module replacement
- Redux DevTools can be used for state debugging
- Socket connection is established on login

## Production Deployment

### Environment Variables
Update `.env` for production:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Set `CLIENT_URL` to your production frontend URL
- Use MongoDB Atlas or production MongoDB instance

### Build Frontend
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

### Deploy Backend
- Use a process manager like PM2
- Set up reverse proxy (nginx)
- Configure CORS for production domain
- Use environment variables for secrets

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or connection string is correct
- Check firewall settings for remote MongoDB

### Socket.io Connection Issues
- Verify CORS settings match your frontend URL
- Check that cookies are being sent (withCredentials: true)
- Ensure JWT token is valid

### Authentication Issues
- Clear browser cookies if login fails
- Check JWT_SECRET is set correctly
- Verify cookie settings (HttpOnly, SameSite)

## License

This project is open source and available for use.

## Contributing

Feel free to submit issues and enhancement requests!
