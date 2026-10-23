import { createSlice } from '@reduxjs/toolkit';

// seoPages is a local-only page builder (no backend resource).
// State is managed inside the SeoPages component via useState.
// This slice is kept minimal and NOT registered in store/index.ts on purpose.
// If backend ever adds /api/admin/seo-pages, wire this slice via store and replace no-op saga.

const initialState = { items: [], item: null, loading: false, error: null, pagination: null };

const slice = createSlice({
  name: 'seoPages',
  initialState,
  reducers: {
    request(state) { state.loading = false; state.error = null; },
    success(state, a) { state.loading = false; state.items = a.payload?.items ?? a.payload ?? []; if (a.payload?.pagination) state.pagination = a.payload.pagination; },
    failure(state, a) { state.loading = false; state.error = a.payload; },
    setItem(state, a) { state.item = a.payload; },
  },
});

export const { request, success, failure, setItem } = slice.actions;
export default slice.reducer;
