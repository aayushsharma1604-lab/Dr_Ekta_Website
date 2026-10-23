import { createSlice } from '@reduxjs/toolkit';

const initialState = { data: null, loading: false, error: null };

const slice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchRequest(state) { state.loading = true; state.error = null; },
    fetchSuccess(state, a) { state.loading = false; state.data = a.payload?.data ?? a.payload; },
    fetchFailure(state, a) { state.loading = false; state.error = a.payload; },
    updateRequest(state) { state.loading = true; state.error = null; },
    updateSuccess(state, a) { state.loading = false; state.data = a.payload?.data ?? a.payload; },
    updateFailure(state, a) { state.loading = false; state.error = a.payload; },
  },
});

export const { fetchRequest, fetchSuccess, fetchFailure, updateRequest, updateSuccess, updateFailure } = slice.actions;
export default slice.reducer;
