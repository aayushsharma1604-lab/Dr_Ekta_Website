import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: null,
  events: [],
  items: [],
  item: null,
  loading: false,
  error: null,
  pagination: null,
};

const slice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    fetchReportsRequest(state, _a) { state.loading = true; state.error = null; },
    fetchReportsSuccess(state, a) {
      state.loading = false;
      state.reports = a.payload;
      // keep backward compat: also set items if array
      if (Array.isArray(a.payload)) state.items = a.payload;
      else if (a.payload?.items) state.items = a.payload.items;
    },
    fetchReportsFailure(state, a) { state.loading = false; state.error = a.payload; },

    fetchEventsRequest(state, _a) { state.loading = true; state.error = null; },
    fetchEventsSuccess(state, a) {
      state.loading = false;
      state.events = a.payload.items ?? a.payload ?? [];
      state.items = a.payload.items ?? a.payload ?? [];
      if (a.payload?.pagination) state.pagination = a.payload.pagination;
    },
    fetchEventsFailure(state, a) { state.loading = false; state.error = a.payload; },

    // backward compat generic
    request(state) { state.loading = true; state.error = null; },
    success(state, a) {
      state.loading = false;
      // if payload looks like paged events
      if (a.payload?.items) {
        state.events = a.payload.items;
        state.items = a.payload.items;
        if (a.payload?.pagination) state.pagination = a.payload.pagination;
      } else {
        state.items = a.payload.items ?? a.payload;
      }
    },
    failure(state, a) { state.loading = false; state.error = a.payload; },
    setItem(state, a) { state.item = a.payload; },
    clearError(state) { state.error = null; },
  },
});

export const {
  fetchReportsRequest, fetchReportsSuccess, fetchReportsFailure,
  fetchEventsRequest, fetchEventsSuccess, fetchEventsFailure,
  request, success, failure, setItem, clearError,
} = slice.actions;
export default slice.reducer;
