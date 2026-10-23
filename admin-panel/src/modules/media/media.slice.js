import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [], item: null, loading: false, error: null, pagination: null, uploadInfo: null };

const slice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    fetchListRequest(state, _a) { state.loading = true; state.error = null; },
    fetchListSuccess(state, a) { state.loading = false; state.items = a.payload.items ?? []; state.pagination = a.payload.pagination ?? null; },
    fetchListFailure(state, a) { state.loading = false; state.error = a.payload; },
    uploadRequest(state, _a) { state.loading = true; state.error = null; },
    uploadSuccess(state, a) { state.loading = false; state.uploadInfo = a.payload; },
    uploadFailure(state, a) { state.loading = false; state.error = a.payload; },
    confirmRequest(state, _a) { state.loading = true; state.error = null; },
    confirmSuccess(state, a) { state.loading = false; state.item = a.payload; },
    confirmFailure(state, a) { state.loading = false; state.error = a.payload; },
    deleteRequest(state, _a) { state.loading = true; state.error = null; },
    deleteSuccess(state) { state.loading = false; },
    deleteFailure(state, a) { state.loading = false; state.error = a.payload; },
    fetchOneRequest(state, _a) { state.loading = true; state.error = null; },
    fetchOneSuccess(state, a) { state.loading = false; state.item = a.payload; },
    fetchOneFailure(state, a) { state.loading = false; state.error = a.payload; },
    // generic for backward compat
    request(state) { state.loading = true; state.error = null; },
    success(state, a) { state.loading = false; state.items = a.payload.items ?? a.payload; if (a.payload?.pagination) state.pagination = a.payload.pagination; },
    failure(state, a) { state.loading = false; state.error = a.payload; },
    setItem(state, a) { state.item = a.payload; },
  },
});

export const {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  uploadRequest, uploadSuccess, uploadFailure,
  confirmRequest, confirmSuccess, confirmFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  request, success, failure, setItem,
} = slice.actions;
export default slice.reducer;
