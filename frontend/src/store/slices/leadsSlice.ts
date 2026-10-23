import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Lead, Pagination, LeadListParams, LeadStats } from "@/lib/api/types";

interface LeadsState {
    items: Lead[];
    current: Lead | null;
    stats: LeadStats | null;
    pagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: LeadsState = {
    items: [], current: null, stats: null, pagination: null,
    loading: false, saving: false, error: null,
};

const leadsSlice = createSlice({
    name: "leads",
    initialState,
    reducers: {
        fetchLeadsRequest: (state, _action: PayloadAction<LeadListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchLeadsSuccess: (state, action: PayloadAction<{ items: Lead[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchLeadsFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchLeadByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchLeadByIdSuccess: (state, action: PayloadAction<Lead>) => { state.current = action.payload; state.loading = false; },
        fetchLeadByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchLeadStatsRequest: (state, _action: PayloadAction<{ startDate?: string; endDate?: string; source?: string } | undefined>) => { state.loading = true; state.error = null; },
        fetchLeadStatsSuccess: (state, action: PayloadAction<LeadStats>) => { state.stats = action.payload; state.loading = false; },
        fetchLeadStatsFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        updateLeadRequest: (state, _action: PayloadAction<{ id: string; data: { leadStatus?: string; appointmentStatus?: string; notes?: string; treatmentInterest?: string } }>) => { state.saving = true; state.error = null; },
        updateLeadSuccess: (state, action: PayloadAction<Lead>) => { state.current = action.payload; state.saving = false; },
        updateLeadFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteLeadRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteLeadSuccess: (state) => { state.current = null; state.saving = false; },
        deleteLeadFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        exportLeadsRequest: (_state, _action: PayloadAction<{ startDate?: string; endDate?: string; source?: string; status?: string } | undefined>) => { },

        clearLeadsError: (state) => { state.error = null; },
    },
});

export const {
    fetchLeadsRequest, fetchLeadsSuccess, fetchLeadsFailure,
    fetchLeadByIdRequest, fetchLeadByIdSuccess, fetchLeadByIdFailure,
    fetchLeadStatsRequest, fetchLeadStatsSuccess, fetchLeadStatsFailure,
    updateLeadRequest, updateLeadSuccess, updateLeadFailure,
    deleteLeadRequest, deleteLeadSuccess, deleteLeadFailure,
    exportLeadsRequest, clearLeadsError,
} = leadsSlice.actions;
export default leadsSlice.reducer;
