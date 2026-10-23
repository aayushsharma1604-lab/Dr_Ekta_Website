import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ReviewQueueItem, Pagination, ReviewQueueParams } from "@/lib/api/types";

interface ReviewQueueState {
    items: ReviewQueueItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: ReviewQueueState = {
    items: [], pagination: null, loading: false, error: null,
};

const reviewQueueSlice = createSlice({
    name: "reviewQueue",
    initialState,
    reducers: {
        fetchReviewQueueRequest: (state, _action: PayloadAction<ReviewQueueParams | undefined>) => { state.loading = true; state.error = null; },
        fetchReviewQueueSuccess: (state, action: PayloadAction<{ items: ReviewQueueItem[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchReviewQueueFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },
        clearReviewQueueError: (state) => { state.error = null; },
    },
});

export const {
    fetchReviewQueueRequest, fetchReviewQueueSuccess, fetchReviewQueueFailure,
    clearReviewQueueError,
} = reviewQueueSlice.actions;
export default reviewQueueSlice.reducer;
