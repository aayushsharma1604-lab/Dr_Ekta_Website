import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Testimonial, Pagination, TestimonialListParams } from "@/lib/api/types";

interface TestimonialsState {
    items: Testimonial[];
    current: Testimonial | null;
    pagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: TestimonialsState = {
    items: [], current: null, pagination: null,
    loading: false, saving: false, error: null,
};

const testimonialsSlice = createSlice({
    name: "testimonials",
    initialState,
    reducers: {
        fetchTestimonialsRequest: (state, _action: PayloadAction<TestimonialListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchTestimonialsSuccess: (state, action: PayloadAction<{ items: Testimonial[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchTestimonialsFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchTestimonialByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchTestimonialByIdSuccess: (state, action: PayloadAction<Testimonial>) => { state.current = action.payload; state.loading = false; },
        fetchTestimonialByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        createTestimonialRequest: (state, _action: PayloadAction<Partial<Testimonial> & { patientDisplayName: string; content: string }>) => { state.saving = true; state.error = null; },
        createTestimonialSuccess: (state, action: PayloadAction<Testimonial>) => { state.current = action.payload; state.saving = false; },
        createTestimonialFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateTestimonialRequest: (state, _action: PayloadAction<{ id: string; data: Partial<Testimonial> }>) => { state.saving = true; state.error = null; },
        updateTestimonialSuccess: (state, action: PayloadAction<Testimonial>) => { state.current = action.payload; state.saving = false; },
        updateTestimonialFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteTestimonialRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteTestimonialSuccess: (state) => { state.current = null; state.saving = false; },
        deleteTestimonialFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        submitTestimonialRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        approveTestimonialRequest: (state, _action: PayloadAction<{ id: string; reviewNote?: string }>) => { state.saving = true; state.error = null; },
        rejectTestimonialRequest: (state, _action: PayloadAction<{ id: string; reviewNote: string }>) => { state.saving = true; state.error = null; },
        publishTestimonialRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        testimonialWorkflowSuccess: (state) => { state.saving = false; },
        testimonialWorkflowFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearTestimonialsError: (state) => { state.error = null; },
        clearCurrentTestimonial: (state) => { state.current = null; },
    },
});

export const {
    fetchTestimonialsRequest, fetchTestimonialsSuccess, fetchTestimonialsFailure,
    fetchTestimonialByIdRequest, fetchTestimonialByIdSuccess, fetchTestimonialByIdFailure,
    createTestimonialRequest, createTestimonialSuccess, createTestimonialFailure,
    updateTestimonialRequest, updateTestimonialSuccess, updateTestimonialFailure,
    deleteTestimonialRequest, deleteTestimonialSuccess, deleteTestimonialFailure,
    submitTestimonialRequest, approveTestimonialRequest, rejectTestimonialRequest,
    publishTestimonialRequest, testimonialWorkflowSuccess, testimonialWorkflowFailure,
    clearTestimonialsError, clearCurrentTestimonial,
} = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
