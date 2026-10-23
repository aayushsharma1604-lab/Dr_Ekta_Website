import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Profile } from "@/lib/api/types";

interface ProfileState {
    data: Profile | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ProfileState = { data: null, loading: false, saving: false, error: null };

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        fetchProfileRequest: (state) => { state.loading = true; state.error = null; },
        fetchProfileSuccess: (state, action: PayloadAction<Profile>) => { state.data = action.payload; state.loading = false; },
        fetchProfileFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        updateProfileRequest: (state, _action: PayloadAction<Partial<Profile>>) => { state.saving = true; state.error = null; },
        updateProfileSuccess: (state, action: PayloadAction<Profile>) => { state.data = action.payload; state.saving = false; },
        updateProfileFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearProfileError: (state) => { state.error = null; },
    },
});

export const {
    fetchProfileRequest, fetchProfileSuccess, fetchProfileFailure,
    updateProfileRequest, updateProfileSuccess, updateProfileFailure,
    clearProfileError,
} = profileSlice.actions;
export default profileSlice.reducer;
