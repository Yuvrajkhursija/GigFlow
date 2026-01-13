import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api/auth';

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, userData);
      toast.success('Registration successful!');
      return data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, credentials);
      toast.success('Login successful!');
      return data.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/logout`);
      toast.success('Logged out successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/me`);
      return data.data.user;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  },
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state) => {
        state.isLoading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
