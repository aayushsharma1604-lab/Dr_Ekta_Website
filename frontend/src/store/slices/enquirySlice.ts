import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { EnquiryPayload, EnquiryResponse } from "@/lib/api/types";

interface EnquiryState {
    submitting: boolean;
    success: boolean;
    response: EnquiryResponse | null;
    error: string | null;
}

const initialState: EnquiryState = {
    submitting: false, success: false, response: null, error: null,
};

const enquirySlice = createSlice({
    name: "enquiry",
    initialState,
    reducers: {
        submitEnquiryRequest: (state, _action: PayloadAction<EnquiryPayload>) => {
            state.submitting = true; state.success = false; state.error = null; state.response = null;
        },
        submitEnquirySuccess: (state, action: PayloadAction<EnquiryResponse>) => {
            state.submitting = false; state.success = true; state.response = action.payload;
        },
        submitEnquiryFailure: (state, action: PayloadAction<string>) => {
            state.submitting = false; state.error = action.payload;
        },
        resetEnquiry: () => initialState,
    },
});

export const {
    submitEnquiryRequest, submitEnquirySuccess, submitEnquiryFailure, resetEnquiry,
} = enquirySlice.actions;
export default enquirySlice.reducer;
