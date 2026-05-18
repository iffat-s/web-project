import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/client';

const storedUser = sessionStorage.getItem('user');

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const res = await authApi.login(creds);
    return res.data; // { accessToken, refreshToken, user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try { await authApi.logout(getState().auth.refreshToken); } catch {}
  sessionStorage.clear();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    refreshToken: sessionStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.refreshToken = action.payload.refreshToken;
        sessionStorage.setItem('accessToken', action.payload.accessToken);
        sessionStorage.setItem('refreshToken', action.payload.refreshToken);
        sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.loading = false; })
      .addCase(register.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.refreshToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
