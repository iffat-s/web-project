import { createSlice } from '@reduxjs/toolkit'

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    campaigns: [],
    loading: false,
  },
  reducers: {},
  extraReducers: () => {},
})

export default adminSlice.reducer