import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MediaAsset, Pagination, MediaListParams, MediaUploadPayload, MediaUploadResponse, MediaConfirmPayload } from "@/lib/api/types";

interface MediaState {
    items: MediaAsset[];
    current: MediaAsset | null;
    uploadData: MediaUploadResponse | null;
    pagination: Pagination | null;
    loading: boolean;
    uploading: boolean;
    error: string | null;
}

const initialState: MediaState = {
    items: [], current: null, uploadData: null, pagination: null,
    loading: false, uploading: false, error: null,
};

const mediaSlice = createSlice({
    name: "media",
    initialState,
    reducers: {
        fetchMediaRequest: (state, _action: PayloadAction<MediaListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchMediaSuccess: (state, action: PayloadAction<{ items: MediaAsset[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchMediaFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        getUploadUrlRequest: (state, _action: PayloadAction<MediaUploadPayload>) => { state.uploading = true; state.error = null; },
        getUploadUrlSuccess: (state, action: PayloadAction<MediaUploadResponse>) => { state.uploadData = action.payload; state.uploading = false; },
        getUploadUrlFailure: (state, action: PayloadAction<string>) => { state.uploading = false; state.error = action.payload; },

        confirmUploadRequest: (state, _action: PayloadAction<MediaConfirmPayload>) => { state.uploading = true; state.error = null; },
        confirmUploadSuccess: (state, action: PayloadAction<MediaAsset>) => { state.current = action.payload; state.uploadData = null; state.uploading = false; },
        confirmUploadFailure: (state, action: PayloadAction<string>) => { state.uploading = false; state.error = action.payload; },

        deleteMediaRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        deleteMediaSuccess: (state) => { state.current = null; state.loading = false; },
        deleteMediaFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        clearMediaError: (state) => { state.error = null; },
        clearUploadData: (state) => { state.uploadData = null; },
    },
});

export const {
    fetchMediaRequest, fetchMediaSuccess, fetchMediaFailure,
    getUploadUrlRequest, getUploadUrlSuccess, getUploadUrlFailure,
    confirmUploadRequest, confirmUploadSuccess, confirmUploadFailure,
    deleteMediaRequest, deleteMediaSuccess, deleteMediaFailure,
    clearMediaError, clearUploadData,
} = mediaSlice.actions;
export default mediaSlice.reducer;
