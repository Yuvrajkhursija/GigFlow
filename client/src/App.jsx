import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getCurrentUser } from './store/slices/authSlice.js';
import { initializeSocket, disconnectSocket } from './utils/socket.js';
import { fetchNotifications, addNotification } from './store/slices/notificationSlice.js';
import { getSocket } from './utils/socket.js';

import Layout from './components/Layout.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import BrowseGigs from './pages/BrowseGigs.jsx';
import CreateGig from './pages/CreateGig.jsx';
import GigDetail from './pages/GigDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on mount
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      initializeSocket();

      // Set up socket listener for notifications
      const socket = getSocket();
      if (socket) {
        const handleNotification = (data) => {
          toast.success(data.message, {
            duration: 5000,
          });
          dispatch(addNotification({
            message: data.message,
            isRead: false,
            createdAt: new Date().toISOString(),
          }));
          // Also fetch notifications to get the full list from server
          dispatch(fetchNotifications());
        };
        
        socket.on('notification', handleNotification);

        return () => {
          if (socket) {
            socket.off('notification', handleNotification);
          }
          disconnectSocket();
        };
      }

      // Fetch notifications
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/gigs" replace />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="gigs" element={<BrowseGigs />} />
        <Route
          path="gigs/new"
          element={
            <ProtectedRoute>
              <CreateGig />
            </ProtectedRoute>
          }
        />
        <Route path="gigs/:gigId" element={<GigDetail />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
