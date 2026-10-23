import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GalleryItem, Pagination, TestimonialListParams } from "@/lib/api/types";

interface GalleryState {
    items: GalleryItem[];
    current: GalleryItem | null;
    pagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: GalleryState = {
    items: [], current: null, pagination: null,
    loading: false, saving: false, error: null,
};

const gallerySlice = createSlice({
    name: "gallery",
    initialState,
    reducers: {
        fetchGalleryRequest: (state, _action: PayloadAction<TestimonialListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchGallerySuccess: (state, action: PayloadAction<{ items: GalleryItem[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchGalleryFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchGalleryItemByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchGalleryItemByIdSuccess: (state, action: PayloadAction<GalleryItem>) => { state.current = action.payload; state.loading = false; },
        fetchGalleryItemByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        createGalleryItemRequest: (state, _action: PayloadAction<{ beforeImg: string; afterImg: string; treatmentTag?: string; content?: string; consent?: unknown; status?: string }>) => { state.saving = true; state.error = null; },
        createGalleryItemSuccess: (state, action: PayloadAction<GalleryItem>) => { state.current = action.payload; state.saving = false; },
        createGalleryItemFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateGalleryItemRequest: (state, _action: PayloadAction<{ id: string; data: Partial<GalleryItem> }>) => { state.saving = true; state.error = null; },
        updateGalleryItemSuccess: (state, action: PayloadAction<GalleryItem>) => { state.current = action.payload; state.saving = false; },
        updateGalleryItemFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteGalleryItemRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteGalleryItemSuccess: (state) => { state.current = null; state.saving = false; },
        deleteGalleryItemFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        submitGalleryItemRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        approveGalleryItemRequest: (state, _action: PayloadAction<{ id: string; reviewNote?: string }>) => { state.saving = true; state.error = null; },
        rejectGalleryItemRequest: (state, _action: PayloadAction<{ id: string; reviewNote: string }>) => { state.saving = true; state.error = null; },
        publishGalleryItemRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        galleryWorkflowSuccess: (state) => { state.saving = false; },
        galleryWorkflowFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearGalleryError: (state) => { state.error = null; },
        clearCurrentGalleryItem: (state) => { state.current = null; },
    },
});

export const {
    fetchGalleryRequest, fetchGallerySuccess, fetchGalleryFailure,
    fetchGalleryItemByIdRequest, fetchGalleryItemByIdSuccess, fetchGalleryItemByIdFailure,
    createGalleryItemRequest, createGalleryItemSuccess, createGalleryItemFailure,
    updateGalleryItemRequest, updateGalleryItemSuccess, updateGalleryItemFailure,
    deleteGalleryItemRequest, deleteGalleryItemSuccess, deleteGalleryItemFailure,
    submitGalleryItemRequest, approveGalleryItemRequest, rejectGalleryItemRequest,
    publishGalleryItemRequest, galleryWorkflowSuccess, galleryWorkflowFailure,
    clearGalleryError, clearCurrentGalleryItem,
} = gallerySlice.actions;
export default gallerySlice.reducer;
