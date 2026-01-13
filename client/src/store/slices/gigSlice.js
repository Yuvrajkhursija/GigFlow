import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api/gigs';

// Get all gigs
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (search = '', { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}${search ? `?search=${search}` : ''}`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch gigs';
      return rejectWithValue(message);
    }
  }
);

// Get single gig
export const fetchGig = createAsyncThunk(
  'gigs/fetchGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/${gigId}`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch gig';
      return rejectWithValue(message);
    }
  }
);

// Create gig
export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, gigData);
      toast.success('Gig created successfully!');
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create gig';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get my gigs
export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/mine`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your gigs';
      return rejectWithValue(message);
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    currentGig: null,
    myGigs: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single gig
      .addCase(fetchGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs.unshift(action.payload);
        state.myGigs.unshift(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch my gigs
      .addCase(fetchMyGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myGigs = action.payload;
      })
      .addCase(fetchMyGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGig } = gigSlice.actions;
export default gigSlice.reducer;
