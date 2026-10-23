import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CuratedPost, Pagination, PaginationParams } from "@/lib/api/types";

interface InstagramState {
    items: CuratedPost[];
    current: CuratedPost | null;
    pagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: InstagramState = {
    items: [], current: null, pagination: null,
    loading: false, saving: false, error: null,
};

const instagramSlice = createSlice({
    name: "instagram",
    initialState,
    reducers: {
        fetchInstagramRequest: (state, _action: PayloadAction<PaginationParams | undefined>) => { state.loading = true; state.error = null; },
        fetchInstagramSuccess: (state, action: PayloadAction<{ items: CuratedPost[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchInstagramFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        createInstagramPostRequest: (state, _action: PayloadAction<{ image: string; permalink: string; caption?: string; order?: number }>) => { state.saving = true; state.error = null; },
        createInstagramPostSuccess: (state, action: PayloadAction<CuratedPost>) => { state.current = action.payload; state.saving = false; },
        createInstagramPostFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateInstagramPostRequest: (state, _action: PayloadAction<{ id: string; data: Partial<CuratedPost> }>) => { state.saving = true; state.error = null; },
        updateInstagramPostSuccess: (state, action: PayloadAction<CuratedPost>) => { state.current = action.payload; state.saving = false; },
        updateInstagramPostFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteInstagramPostRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteInstagramPostSuccess: (state) => { state.current = null; state.saving = false; },
        deleteInstagramPostFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearInstagramError: (state) => { state.error = null; },
    },
});

export const {
    fetchInstagramRequest, fetchInstagramSuccess, fetchInstagramFailure,
    createInstagramPostRequest, createInstagramPostSuccess, createInstagramPostFailure,
    updateInstagramPostRequest, updateInstagramPostSuccess, updateInstagramPostFailure,
    deleteInstagramPostRequest, deleteInstagramPostSuccess, deleteInstagramPostFailure,
    clearInstagramError,
} = instagramSlice.actions;
export default instagramSlice.reducer;
