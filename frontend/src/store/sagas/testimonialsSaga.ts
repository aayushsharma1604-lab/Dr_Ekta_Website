import { call, put, takeLatest } from "redux-saga/effects";
import {
    getTestimonials, getAdminTestimonialById,
    createTestimonial as apiCreate, updateTestimonial as apiUpdate, deleteTestimonial as apiDelete,
    submitTestimonial as apiSubmit, approveTestimonial as apiApprove,
    rejectTestimonial as apiReject, publishTestimonial as apiPublish,
} from "@/lib/api";
import {
    fetchTestimonialsRequest, fetchTestimonialsSuccess, fetchTestimonialsFailure,
    fetchTestimonialByIdRequest, fetchTestimonialByIdSuccess, fetchTestimonialByIdFailure,
    createTestimonialRequest, createTestimonialSuccess, createTestimonialFailure,
    updateTestimonialRequest, updateTestimonialSuccess, updateTestimonialFailure,
    deleteTestimonialRequest, deleteTestimonialSuccess, deleteTestimonialFailure,
    submitTestimonialRequest, approveTestimonialRequest, rejectTestimonialRequest,
    publishTestimonialRequest, testimonialWorkflowSuccess, testimonialWorkflowFailure,
} from "../slices/testimonialsSlice";
import type { Testimonial, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchTestimonialsRequest>): Generator {
    try {
        const data = (yield call(getTestimonials, action.payload)) as PagedResponse<Testimonial>;
        yield put(fetchTestimonialsSuccess(data));
    } catch (e) { yield put(fetchTestimonialsFailure(errMsg(e, "Failed to load testimonials"))); }
}

function* fetchByIdSaga(action: ReturnType<typeof fetchTestimonialByIdRequest>): Generator {
    try {
        const data = (yield call(getAdminTestimonialById, action.payload)) as Testimonial;
        yield put(fetchTestimonialByIdSuccess(data));
    } catch (e) { yield put(fetchTestimonialByIdFailure(errMsg(e, "Testimonial not found"))); }
}

function* createSaga(action: ReturnType<typeof createTestimonialRequest>): Generator {
    try {
        const data = (yield call(apiCreate, action.payload)) as Testimonial;
        yield put(createTestimonialSuccess(data));
    } catch (e) { yield put(createTestimonialFailure(errMsg(e, "Failed to create"))); }
}

function* updateSaga(action: ReturnType<typeof updateTestimonialRequest>): Generator {
    try {
        const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as Testimonial;
        yield put(updateTestimonialSuccess(data));
    } catch (e) { yield put(updateTestimonialFailure(errMsg(e, "Failed to update"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteTestimonialRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteTestimonialSuccess()); }
    catch (e) { yield put(deleteTestimonialFailure(errMsg(e, "Failed to delete"))); }
}

function* submitSaga(action: ReturnType<typeof submitTestimonialRequest>): Generator {
    try { yield call(apiSubmit, action.payload); yield put(testimonialWorkflowSuccess()); }
    catch (e) { yield put(testimonialWorkflowFailure(errMsg(e, "Submit failed"))); }
}

function* approveSaga(action: ReturnType<typeof approveTestimonialRequest>): Generator {
    try { yield call(apiApprove, action.payload.id, action.payload.reviewNote); yield put(testimonialWorkflowSuccess()); }
    catch (e) { yield put(testimonialWorkflowFailure(errMsg(e, "Approve failed — check consent"))); }
}

function* rejectSaga(action: ReturnType<typeof rejectTestimonialRequest>): Generator {
    try { yield call(apiReject, action.payload.id, action.payload.reviewNote); yield put(testimonialWorkflowSuccess()); }
    catch (e) { yield put(testimonialWorkflowFailure(errMsg(e, "Reject failed"))); }
}

function* publishSaga(action: ReturnType<typeof publishTestimonialRequest>): Generator {
    try { yield call(apiPublish, action.payload); yield put(testimonialWorkflowSuccess()); }
    catch (e) { yield put(testimonialWorkflowFailure(errMsg(e, "Publish failed — check consent"))); }
}

export default function* testimonialsSaga() {
    yield takeLatest(fetchTestimonialsRequest.type, fetchListSaga);
    yield takeLatest(fetchTestimonialByIdRequest.type, fetchByIdSaga);
    yield takeLatest(createTestimonialRequest.type, createSaga);
    yield takeLatest(updateTestimonialRequest.type, updateSaga);
    yield takeLatest(deleteTestimonialRequest.type, deleteSaga);
    yield takeLatest(submitTestimonialRequest.type, submitSaga);
    yield takeLatest(approveTestimonialRequest.type, approveSaga);
    yield takeLatest(rejectTestimonialRequest.type, rejectSaga);
    yield takeLatest(publishTestimonialRequest.type, publishSaga);
}
