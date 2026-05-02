import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import rewardsReducer from '../features/rewards/rewardsSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'
import loyaltyReducer from '../features/loyalty/loyaltySlice'
import adminReducer from '../features/admin/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rewards: rewardsReducer,
    transactions: transactionsReducer,
    loyalty: loyaltyReducer,
    admin: adminReducer,
  },
})