import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/notifications';

// Get notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${API_URL}/${notificationId}/read`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark as read';
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = action.payload;
        const index = state.notifications.findIndex((n) => n._id === notification._id);
        if (index !== -1) {
          state.notifications[index] = notification;
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
