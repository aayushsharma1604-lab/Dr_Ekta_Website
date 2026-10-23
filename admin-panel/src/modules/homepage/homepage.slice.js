import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  config: null,
  items: [],
  item: null,
  loading: false,
  error: null,
  pagination: null,
};

const slice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    fetchConfigRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchConfigSuccess(state, a) {
      state.loading = false;
      state.config = a.payload?.data ?? a.payload;
      // also keep generic fields for backward compat
      state.item = a.payload?.data ?? a.payload;
    },
    fetchConfigFailure(state, a) {
      state.loading = false;
      state.error = a.payload;
    },
    updateConfigRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateConfigSuccess(state, a) {
      state.loading = false;
      state.config = a.payload?.data ?? a.payload;
      state.item = a.payload?.data ?? a.payload;
    },
    updateConfigFailure(state, a) {
      state.loading = false;
      state.error = a.payload;
    },
    // aliases for simpler dispatch names
    fetchConfig(state) {
      state.loading = true;
      state.error = null;
    },
    updateConfig(state) {
      state.loading = true;
      state.error = null;
    },
    // generic fallback for old code
    request(state) {
      state.loading = true;
      state.error = null;
    },
    success(state, a) {
      state.loading = false;
      state.items = a.payload.items ?? a.payload;
      if (a.payload?.pagination) state.pagination = a.payload.pagination;
    },
    failure(state, a) {
      state.loading = false;
      state.error = a.payload;
    },
    setItem(state, a) {
      state.item = a.payload;
    },
  },
});

export const {
  fetchConfigRequest,
  fetchConfigSuccess,
  fetchConfigFailure,
  updateConfigRequest,
  updateConfigSuccess,
  updateConfigFailure,
  fetchConfig,
  updateConfig,
  request,
  success,
  failure,
  setItem,
} = slice.actions;

export default slice.reducer;
