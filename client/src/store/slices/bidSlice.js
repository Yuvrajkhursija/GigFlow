import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api/bids';

// Create bid
export const createBid = createAsyncThunk(
  'bids/createBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, bidData);
      toast.success('Bid submitted successfully!');
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit bid';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get bids for a gig
export const fetchGigBids = createAsyncThunk(
  'bids/fetchGigBids',
  async (gigId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/${gigId}`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bids';
      return rejectWithValue(message);
    }
  }
);

// Get my bids
export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/mine`);
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your bids';
      return rejectWithValue(message);
    }
  }
);

// Hire a bid
export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${API_URL}/${bidId}/hire`);
      toast.success('Freelancer hired successfully!');
      return data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to hire freelancer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    gigBids: [],
    myBids: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearGigBids: (state) => {
      state.gigBids = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create bid
      .addCase(createBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigBids.push(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch gig bids
      .addCase(fetchGigBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigBids = action.payload;
      })
      .addCase(fetchGigBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch my bids
      .addCase(fetchMyBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Hire bid
      .addCase(hireBid.fulfilled, (state, action) => {
        const bidId = action.payload._id;
        state.gigBids = state.gigBids.map((bid) =>
          bid._id === bidId
            ? { ...bid, status: 'hired' }
            : bid.status === 'pending'
            ? { ...bid, status: 'rejected' }
            : bid
        );
      });
  },
});

export const { clearGigBids } = bidSlice.actions;
export default bidSlice.reducer;
