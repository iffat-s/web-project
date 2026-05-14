import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { rewardAPI, redemptionAPI } from '../../services/api'
import toast from 'react-hot-toast'

export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rewardAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (rewardId, { rejectWithValue, dispatch }) => {
    try {
      const response = await redemptionAPI.redeem(rewardId)
      toast.success('Reward redeemed successfully!')
      dispatch(fetchRewards())
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Redemption failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default rewardsSlice.reducer