import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ClinicInfo } from "@/lib/api/types";

interface ClinicState {
    info: ClinicInfo | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ClinicState = { info: null, loading: false, saving: false, error: null };

const clinicSlice = createSlice({
    name: "clinic",
    initialState,
    reducers: {
        fetchClinicRequest: (state) => { state.loading = true; state.error = null; },
        fetchClinicSuccess: (state, action: PayloadAction<ClinicInfo>) => { state.info = action.payload; state.loading = false; },
        fetchClinicFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        updateClinicRequest: (state, _action: PayloadAction<Partial<ClinicInfo>>) => { state.saving = true; state.error = null; },
        updateClinicSuccess: (state, action: PayloadAction<ClinicInfo>) => { state.info = action.payload; state.saving = false; },
        updateClinicFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearClinicError: (state) => { state.error = null; },
    },
});

export const {
    fetchClinicRequest, fetchClinicSuccess, fetchClinicFailure,
    updateClinicRequest, updateClinicSuccess, updateClinicFailure,
    clearClinicError,
} = clinicSlice.actions;
export default clinicSlice.reducer;
