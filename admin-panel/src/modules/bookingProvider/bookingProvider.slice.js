import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  clicks: null,
  clicksLoading: false,
  clicksError: null,
};

const slice = createSlice({
  name: 'bookingProvider',
  initialState,
  reducers: {
    fetchRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess(state, a) {
      state.loading = false;
      state.data = a.payload;
    },
    fetchFailure(state, a) {
      state.loading = false;
      state.error = a.payload;
    },
    updateRequest(state) {
      state.loading = true;
      state.error = null;
    },
    updateSuccess(state, a) {
      state.loading = false;
      state.data = a.payload;
    },
    updateFailure(state, a) {
      state.loading = false;
      state.error = a.payload;
    },
    fetchClicksRequest(state) {
      state.clicksLoading = true;
      state.clicksError = null;
    },
    fetchClicksSuccess(state, a) {
      state.clicksLoading = false;
      state.clicks = a.payload;
    },
    fetchClicksFailure(state, a) {
      state.clicksLoading = false;
      state.clicksError = a.payload;
    },
  },
});

export const {
  fetchRequest,
  fetchSuccess,
  fetchFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  fetchClicksRequest,
  fetchClicksSuccess,
  fetchClicksFailure,
} = slice.actions;

export default slice.reducer;
