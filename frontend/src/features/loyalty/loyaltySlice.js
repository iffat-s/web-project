import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loyaltyAPI } from '../../services/api'

export const fetchLoyaltyProfile = createAsyncThunk(
  'loyalty/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loyaltyAPI.getMyProfile()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'loyalty/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loyaltyAPI.getTransactions()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    profile: null,
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyaltyProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLoyaltyProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchLoyaltyProfile.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload
      })
  },
})

export default loyaltySlice.reducer