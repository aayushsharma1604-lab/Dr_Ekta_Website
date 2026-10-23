import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BookingCTA, BookingProviderConfig } from "@/lib/api/types";

interface BookingState {
    cta: BookingCTA | null;
    providerConfig: BookingProviderConfig | null;
    practoClicks: { totalClicks: number; dailyStats: Array<{ _id: string; count: number }> } | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: BookingState = {
    cta: null, providerConfig: null, practoClicks: null,
    loading: false, saving: false, error: null,
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        fetchBookingCtaRequest: (state) => { state.loading = true; state.error = null; },
        fetchBookingCtaSuccess: (state, action: PayloadAction<BookingCTA>) => { state.cta = action.payload; state.loading = false; },
        fetchBookingCtaFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        logPractoClickRequest: () => { },

        fetchBookingProviderRequest: (state) => { state.loading = true; state.error = null; },
        fetchBookingProviderSuccess: (state, action: PayloadAction<BookingProviderConfig>) => { state.providerConfig = action.payload; state.loading = false; },
        fetchBookingProviderFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        updateBookingProviderRequest: (state, _action: PayloadAction<Partial<BookingProviderConfig>>) => { state.saving = true; state.error = null; },
        updateBookingProviderSuccess: (state, action: PayloadAction<BookingProviderConfig>) => { state.providerConfig = action.payload; state.saving = false; },
        updateBookingProviderFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        fetchPractoClicksRequest: (state, _action: PayloadAction<{ startDate?: string; endDate?: string } | undefined>) => { state.loading = true; state.error = null; },
        fetchPractoClicksSuccess: (state, action: PayloadAction<{ totalClicks: number; dailyStats: Array<{ _id: string; count: number }> }>) => { state.practoClicks = action.payload; state.loading = false; },
        fetchPractoClicksFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        clearBookingError: (state) => { state.error = null; },
    },
});

export const {
    fetchBookingCtaRequest, fetchBookingCtaSuccess, fetchBookingCtaFailure,
    logPractoClickRequest,
    fetchBookingProviderRequest, fetchBookingProviderSuccess, fetchBookingProviderFailure,
    updateBookingProviderRequest, updateBookingProviderSuccess, updateBookingProviderFailure,
    fetchPractoClicksRequest, fetchPractoClicksSuccess, fetchPractoClicksFailure,
    clearBookingError,
} = bookingSlice.actions;
export default bookingSlice.reducer;
