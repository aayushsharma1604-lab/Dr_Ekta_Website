import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state, _action) { state.loading = true; state.error = null; },
    loginSuccess(state, a) {
      state.loading = false;
      state.user = a.payload.user;
      state.accessToken = a.payload.accessToken;
      state.refreshToken = a.payload.refreshToken;
    },
    loginFailure(state, a) { state.loading = false; state.error = a.payload; },
    logoutRequest(state, _action) { state.loading = true; },
    logoutSuccess(state) { state.loading = false; state.user = null; state.accessToken = null; state.refreshToken = null; },
    refreshRequest(state, _action) { state.loading = true; },
    refreshSuccess(state, a) {
      state.loading = false;
      state.accessToken = a.payload.accessToken;
      state.refreshToken = a.payload.refreshToken;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess, refreshRequest, refreshSuccess } = slice.actions;
export default slice.reducer;
