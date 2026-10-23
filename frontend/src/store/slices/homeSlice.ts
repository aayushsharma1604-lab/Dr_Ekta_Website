import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { HomepageAggregate, HomepageConfig } from "@/lib/api/types";

interface HomeState {
    aggregate: HomepageAggregate | null;
    config: HomepageConfig | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: HomeState = {
    aggregate: null, config: null,
    loading: false, saving: false, error: null,
};

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {
        fetchHomeRequest: (state) => { state.loading = true; state.error = null; },
        fetchHomeSuccess: (state, action: PayloadAction<HomepageAggregate>) => { state.aggregate = action.payload; state.loading = false; },
        fetchHomeFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchHomeConfigRequest: (state) => { state.loading = true; state.error = null; },
        fetchHomeConfigSuccess: (state, action: PayloadAction<HomepageConfig>) => { state.config = action.payload; state.loading = false; },
        fetchHomeConfigFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        updateHomeConfigRequest: (state, _action: PayloadAction<Partial<HomepageConfig>>) => { state.saving = true; state.error = null; },
        updateHomeConfigSuccess: (state, action: PayloadAction<HomepageConfig>) => { state.config = action.payload; state.saving = false; },
        updateHomeConfigFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearHomeError: (state) => { state.error = null; },
    },
});

export const {
    fetchHomeRequest, fetchHomeSuccess, fetchHomeFailure,
    fetchHomeConfigRequest, fetchHomeConfigSuccess, fetchHomeConfigFailure,
    updateHomeConfigRequest, updateHomeConfigSuccess, updateHomeConfigFailure,
    clearHomeError,
} = homeSlice.actions;
export default homeSlice.reducer;
