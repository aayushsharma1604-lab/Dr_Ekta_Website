import { call, put, takeLatest } from "redux-saga/effects";
import {
    getTreatments, getTreatmentBySlug, getAdminTreatments, getAdminTreatmentById,
    createTreatment as apiCreate, updateTreatment as apiUpdate, deleteTreatment as apiDelete,
    submitTreatment as apiSubmit, approveTreatment as apiApprove,
    rejectTreatment as apiReject, publishTreatment as apiPublish,
    createDraftFromPublished as apiDraft,
} from "@/lib/api";
import {
    fetchTreatmentsRequest, fetchTreatmentsSuccess, fetchTreatmentsFailure,
    fetchTreatmentBySlugRequest, fetchTreatmentBySlugSuccess, fetchTreatmentBySlugFailure,
    fetchAdminTreatmentsRequest, fetchAdminTreatmentsSuccess, fetchAdminTreatmentsFailure,
    fetchAdminTreatmentByIdRequest, fetchAdminTreatmentByIdSuccess, fetchAdminTreatmentByIdFailure,
    createTreatmentRequest, createTreatmentSuccess, createTreatmentFailure,
    updateTreatmentRequest, updateTreatmentSuccess, updateTreatmentFailure,
    deleteTreatmentRequest, deleteTreatmentSuccess, deleteTreatmentFailure,
    submitTreatmentRequest, approveTreatmentRequest, rejectTreatmentRequest,
    publishTreatmentRequest, createDraftRequest, workflowSuccess, workflowFailure,
} from "../slices/treatmentsSlice";
import type { Treatment, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

function* fetchListSaga(action: ReturnType<typeof fetchTreatmentsRequest>): Generator {
    try {
        const data = (yield call(getTreatments, action.payload)) as PagedResponse<Treatment>;
        yield put(fetchTreatmentsSuccess(data));
    } catch (e) { yield put(fetchTreatmentsFailure(errMsg(e, "Failed to load treatments"))); }
}

function* fetchBySlugSaga(action: ReturnType<typeof fetchTreatmentBySlugRequest>): Generator {
    try {
        const data = (yield call(getTreatmentBySlug, action.payload)) as Treatment;
        yield put(fetchTreatmentBySlugSuccess(data));
    } catch (e) { yield put(fetchTreatmentBySlugFailure(errMsg(e, "Treatment not found"))); }
}

function* fetchAdminListSaga(action: ReturnType<typeof fetchAdminTreatmentsRequest>): Generator {
    try {
        const data = (yield call(getAdminTreatments, action.payload)) as PagedResponse<Treatment>;
        yield put(fetchAdminTreatmentsSuccess(data));
    } catch (e) { yield put(fetchAdminTreatmentsFailure(errMsg(e, "Failed to load admin treatments"))); }
}

function* fetchAdminByIdSaga(action: ReturnType<typeof fetchAdminTreatmentByIdRequest>): Generator {
    try {
        const data = (yield call(getAdminTreatmentById, action.payload)) as Treatment;
        yield put(fetchAdminTreatmentByIdSuccess(data));
    } catch (e) { yield put(fetchAdminTreatmentByIdFailure(errMsg(e, "Treatment not found"))); }
}

function* createSaga(action: ReturnType<typeof createTreatmentRequest>): Generator {
    try {
        const data = (yield call(apiCreate, action.payload)) as Treatment;
        yield put(createTreatmentSuccess(data));
    } catch (e) { yield put(createTreatmentFailure(errMsg(e, "Failed to create treatment"))); }
}

function* updateSaga(action: ReturnType<typeof updateTreatmentRequest>): Generator {
    try {
        const { id, data: body } = action.payload;
        const data = (yield call(apiUpdate, id, body)) as Treatment;
        yield put(updateTreatmentSuccess(data));
    } catch (e) { yield put(updateTreatmentFailure(errMsg(e, "Failed to update treatment"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteTreatmentRequest>): Generator {
    try {
        yield call(apiDelete, action.payload);
        yield put(deleteTreatmentSuccess());
    } catch (e) { yield put(deleteTreatmentFailure(errMsg(e, "Failed to delete treatment"))); }
}

function* submitSaga(action: ReturnType<typeof submitTreatmentRequest>): Generator {
    try {
        yield call(apiSubmit, action.payload);
        const updated = (yield call(getAdminTreatmentById, action.payload)) as Treatment;
        yield put(workflowSuccess(updated));
    } catch (e) { yield put(workflowFailure(errMsg(e, "Failed to submit treatment"))); }
}

function* approveSaga(action: ReturnType<typeof approveTreatmentRequest>): Generator {
    try {
        yield call(apiApprove, action.payload.id, action.payload.reviewNote);
        const updated = (yield call(getAdminTreatmentById, action.payload.id)) as Treatment;
        yield put(workflowSuccess(updated));
    } catch (e) { yield put(workflowFailure(errMsg(e, "Failed to approve treatment"))); }
}

function* rejectSaga(action: ReturnType<typeof rejectTreatmentRequest>): Generator {
    try {
        yield call(apiReject, action.payload.id, action.payload.reviewNote);
        const updated = (yield call(getAdminTreatmentById, action.payload.id)) as Treatment;
        yield put(workflowSuccess(updated));
    } catch (e) { yield put(workflowFailure(errMsg(e, "Failed to reject treatment"))); }
}

function* publishSaga(action: ReturnType<typeof publishTreatmentRequest>): Generator {
    try {
        yield call(apiPublish, action.payload);
        const updated = (yield call(getAdminTreatmentById, action.payload)) as Treatment;
        yield put(workflowSuccess(updated));
    } catch (e) { yield put(workflowFailure(errMsg(e, "Failed to publish treatment"))); }
}

function* draftSaga(action: ReturnType<typeof createDraftRequest>): Generator {
    try {
        const draft = (yield call(apiDraft, action.payload)) as Treatment;
        yield put(workflowSuccess(draft));
    } catch (e) { yield put(workflowFailure(errMsg(e, "Failed to create draft"))); }
}

export default function* treatmentsSaga() {
    yield takeLatest(fetchTreatmentsRequest.type, fetchListSaga);
    yield takeLatest(fetchTreatmentBySlugRequest.type, fetchBySlugSaga);
    yield takeLatest(fetchAdminTreatmentsRequest.type, fetchAdminListSaga);
    yield takeLatest(fetchAdminTreatmentByIdRequest.type, fetchAdminByIdSaga);
    yield takeLatest(createTreatmentRequest.type, createSaga);
    yield takeLatest(updateTreatmentRequest.type, updateSaga);
    yield takeLatest(deleteTreatmentRequest.type, deleteSaga);
    yield takeLatest(submitTreatmentRequest.type, submitSaga);
    yield takeLatest(approveTreatmentRequest.type, approveSaga);
    yield takeLatest(rejectTreatmentRequest.type, rejectSaga);
    yield takeLatest(publishTreatmentRequest.type, publishSaga);
    yield takeLatest(createDraftRequest.type, draftSaga);
}
