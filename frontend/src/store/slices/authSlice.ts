import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/api/types";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ── Login ──
    loginRequest: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // ── Logout ──
    logoutRequest: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },
    // ── Refresh (background) ──
    refreshTokenRequest: () => { },
    refreshTokenSuccess: (state) => {
      // tokens handled in client.ts; just confirm session alive
      state.isAuthenticated = true;
    },
    refreshTokenFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    // ── Hydrate from stored session ──
    hydrateAuth: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest, loginSuccess, loginFailure,
  logoutRequest, logoutSuccess, logoutFailure,
  refreshTokenRequest, refreshTokenSuccess, refreshTokenFailure,
  hydrateAuth, clearAuthError,
} = authSlice.actions;
export default authSlice.reducer;
