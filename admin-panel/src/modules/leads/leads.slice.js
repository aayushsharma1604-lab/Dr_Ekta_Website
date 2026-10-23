import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [], item: null, stats: null, loading: false, error: null, pagination: null };

const slice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    fetchListRequest(state, _a) { state.loading = true; state.error = null; },
    fetchListSuccess(state, a) { state.loading = false; state.items = a.payload.items ?? []; state.pagination = a.payload.pagination ?? null; },
    fetchListFailure(state, a) { state.loading = false; state.error = a.payload; },
    fetchStatsRequest(state, _a) { state.loading = true; },
    fetchStatsSuccess(state, a) { state.loading = false; state.stats = a.payload; },
    fetchStatsFailure(state, a) { state.loading = false; state.error = a.payload; },
    fetchOneRequest(state, _a) { state.loading = true; state.error = null; },
    fetchOneSuccess(state, a) { state.loading = false; state.item = a.payload; },
    fetchOneFailure(state, a) { state.loading = false; state.error = a.payload; },
    updateRequest(state, _a) { state.loading = true; state.error = null; },
    updateSuccess(state, a) { state.loading = false; state.item = a.payload; },
    updateFailure(state, a) { state.loading = false; state.error = a.payload; },
    deleteRequest(state, _a) { state.loading = true; state.error = null; },
    deleteSuccess(state) { state.loading = false; },
    deleteFailure(state, a) { state.loading = false; state.error = a.payload; },
    request(state, _a) { state.loading = true; state.error = null; },
    success(state, a) { state.loading = false; state.items = a.payload.items ?? a.payload; if (a.payload?.pagination) state.pagination = a.payload.pagination; },
    failure(state, a) { state.loading = false; state.error = a.payload; },
    setItem(state, a) { state.item = a.payload; },
  },
});

export const {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  updateRequest, updateSuccess, updateFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  request, success, failure, setItem,
} = slice.actions;
export default slice.reducer;
