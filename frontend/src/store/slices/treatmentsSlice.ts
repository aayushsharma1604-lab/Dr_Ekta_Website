import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Treatment, Pagination, TreatmentListParams } from "@/lib/api/types";

interface TreatmentsState {
    items: Treatment[];
    current: Treatment | null;
    pagination: Pagination | null;
    adminItems: Treatment[];
    adminPagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: TreatmentsState = {
    items: [], current: null, pagination: null,
    adminItems: [], adminPagination: null,
    loading: false, saving: false, error: null,
};

const treatmentsSlice = createSlice({
    name: "treatments",
    initialState,
    reducers: {
        // ── Public ──
        fetchTreatmentsRequest: (state, _action: PayloadAction<TreatmentListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchTreatmentsSuccess: (state, action: PayloadAction<{ items: Treatment[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchTreatmentsFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchTreatmentBySlugRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchTreatmentBySlugSuccess: (state, action: PayloadAction<Treatment>) => { state.current = action.payload; state.loading = false; },
        fetchTreatmentBySlugFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        // ── Admin list / detail ──
        fetchAdminTreatmentsRequest: (state, _action: PayloadAction<(TreatmentListParams & { status?: string }) | undefined>) => { state.loading = true; state.error = null; },
        fetchAdminTreatmentsSuccess: (state, action: PayloadAction<{ items: Treatment[]; pagination: Pagination }>) => {
            state.adminItems = action.payload.items; state.adminPagination = action.payload.pagination; state.loading = false;
        },
        fetchAdminTreatmentsFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchAdminTreatmentByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchAdminTreatmentByIdSuccess: (state, action: PayloadAction<Treatment>) => { state.current = action.payload; state.loading = false; },
        fetchAdminTreatmentByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        // ── Admin CRUD ──
        createTreatmentRequest: (state, _action: PayloadAction<Partial<Treatment> & { title: string }>) => { state.saving = true; state.error = null; },
        createTreatmentSuccess: (state, action: PayloadAction<Treatment>) => { state.current = action.payload; state.saving = false; },
        createTreatmentFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateTreatmentRequest: (state, _action: PayloadAction<{ id: string; data: Partial<Treatment> }>) => { state.saving = true; state.error = null; },
        updateTreatmentSuccess: (state, action: PayloadAction<Treatment>) => { state.current = action.payload; state.saving = false; },
        updateTreatmentFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteTreatmentRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteTreatmentSuccess: (state) => { state.current = null; state.saving = false; },
        deleteTreatmentFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        // ── Workflow ──
        submitTreatmentRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        approveTreatmentRequest: (state, _action: PayloadAction<{ id: string; reviewNote?: string }>) => { state.saving = true; state.error = null; },
        rejectTreatmentRequest: (state, _action: PayloadAction<{ id: string; reviewNote: string }>) => { state.saving = true; state.error = null; },
        publishTreatmentRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        createDraftRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        workflowSuccess: (state, action: PayloadAction<Treatment | null>) => {
            if (action.payload) state.current = action.payload;
            state.saving = false;
        },
        workflowFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearTreatmentsError: (state) => { state.error = null; },
        clearCurrentTreatment: (state) => { state.current = null; },
    },
});

export const {
    fetchTreatmentsRequest, fetchTreatmentsSuccess, fetchTreatmentsFailure,
    fetchTreatmentBySlugRequest, fetchTreatmentBySlugSuccess, fetchTreatmentBySlugFailure,
    fetchAdminTreatmentsRequest, fetchAdminTreatmentsSuccess, fetchAdminTreatmentsFailure,
    fetchAdminTreatmentByIdRequest, fetchAdminTreatmentByIdSuccess, fetchAdminTreatmentByIdFailure,
    createTreatmentRequest, createTreatmentSuccess, createTreatmentFailure,
    updateTreatmentRequest, updateTreatmentSuccess, updateTreatmentFailure,
    deleteTreatmentRequest, deleteTreatmentSuccess, deleteTreatmentFailure,
    submitTreatmentRequest, approveTreatmentRequest, rejectTreatmentRequest,
    publishTreatmentRequest, createDraftRequest, workflowSuccess, workflowFailure,
    clearTreatmentsError, clearCurrentTreatment,
} = treatmentsSlice.actions;
export default treatmentsSlice.reducer;
