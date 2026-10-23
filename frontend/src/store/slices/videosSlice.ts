import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Video, Pagination, VideoListParams } from "@/lib/api/types";

interface VideosState {
    items: Video[];
    current: Video | null;
    pagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: VideosState = {
    items: [], current: null, pagination: null,
    loading: false, saving: false, error: null,
};

const videosSlice = createSlice({
    name: "videos",
    initialState,
    reducers: {
        fetchVideosRequest: (state, _action: PayloadAction<VideoListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchVideosSuccess: (state, action: PayloadAction<{ items: Video[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchVideosFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchVideoByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchVideoByIdSuccess: (state, action: PayloadAction<Video>) => { state.current = action.payload; state.loading = false; },
        fetchVideoByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        createVideoRequest: (state, _action: PayloadAction<{ url: string; title: string; category: string; thumbnail?: string; order?: number; status?: string; transcript?: string }>) => { state.saving = true; state.error = null; },
        createVideoSuccess: (state, action: PayloadAction<Video>) => { state.current = action.payload; state.saving = false; },
        createVideoFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateVideoRequest: (state, _action: PayloadAction<{ id: string; data: Partial<Video> & { url: string; title: string; category: string } }>) => { state.saving = true; state.error = null; },
        updateVideoSuccess: (state, action: PayloadAction<Video>) => { state.current = action.payload; state.saving = false; },
        updateVideoFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteVideoRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteVideoSuccess: (state) => { state.current = null; state.saving = false; },
        deleteVideoFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearVideosError: (state) => { state.error = null; },
        clearCurrentVideo: (state) => { state.current = null; },
    },
});

export const {
    fetchVideosRequest, fetchVideosSuccess, fetchVideosFailure,
    fetchVideoByIdRequest, fetchVideoByIdSuccess, fetchVideoByIdFailure,
    createVideoRequest, createVideoSuccess, createVideoFailure,
    updateVideoRequest, updateVideoSuccess, updateVideoFailure,
    deleteVideoRequest, deleteVideoSuccess, deleteVideoFailure,
    clearVideosError, clearCurrentVideo,
} = videosSlice.actions;
export default videosSlice.reducer;
