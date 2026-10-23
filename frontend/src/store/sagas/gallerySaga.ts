import { call, put, takeLatest } from "redux-saga/effects";
import {
    getGallery, getAdminGalleryById,
    createGalleryItem as apiCreate, updateGalleryItem as apiUpdate, deleteGalleryItem as apiDelete,
    submitGalleryItem as apiSubmit, approveGalleryItem as apiApprove,
    rejectGalleryItem as apiReject, publishGalleryItem as apiPublish,
} from "@/lib/api";
import {
    fetchGalleryRequest, fetchGallerySuccess, fetchGalleryFailure,
    fetchGalleryItemByIdRequest, fetchGalleryItemByIdSuccess, fetchGalleryItemByIdFailure,
    createGalleryItemRequest, createGalleryItemSuccess, createGalleryItemFailure,
    updateGalleryItemRequest, updateGalleryItemSuccess, updateGalleryItemFailure,
    deleteGalleryItemRequest, deleteGalleryItemSuccess, deleteGalleryItemFailure,
    submitGalleryItemRequest, approveGalleryItemRequest, rejectGalleryItemRequest,
    publishGalleryItemRequest, galleryWorkflowSuccess, galleryWorkflowFailure,
} from "../slices/gallerySlice";
import type { GalleryItem, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchGalleryRequest>): Generator {
    try {
        const data = (yield call(getGallery, action.payload)) as PagedResponse<GalleryItem>;
        yield put(fetchGallerySuccess(data));
    } catch (e) { yield put(fetchGalleryFailure(errMsg(e, "Failed to load gallery"))); }
}

function* fetchByIdSaga(action: ReturnType<typeof fetchGalleryItemByIdRequest>): Generator {
    try {
        const data = (yield call(getAdminGalleryById, action.payload)) as GalleryItem;
        yield put(fetchGalleryItemByIdSuccess(data));
    } catch (e) { yield put(fetchGalleryItemByIdFailure(errMsg(e, "Gallery item not found"))); }
}

function* createSaga(action: ReturnType<typeof createGalleryItemRequest>): Generator {
    try { const data = (yield call(apiCreate, action.payload)) as GalleryItem; yield put(createGalleryItemSuccess(data)); }
    catch (e) { yield put(createGalleryItemFailure(errMsg(e, "Failed to create"))); }
}

function* updateSaga(action: ReturnType<typeof updateGalleryItemRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as GalleryItem; yield put(updateGalleryItemSuccess(data)); }
    catch (e) { yield put(updateGalleryItemFailure(errMsg(e, "Failed to update"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteGalleryItemRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteGalleryItemSuccess()); }
    catch (e) { yield put(deleteGalleryItemFailure(errMsg(e, "Failed to delete"))); }
}

function* submitSaga(a: ReturnType<typeof submitGalleryItemRequest>): Generator {
    try { yield call(apiSubmit, a.payload); yield put(galleryWorkflowSuccess()); } catch (e) { yield put(galleryWorkflowFailure(errMsg(e, "Submit failed"))); }
}
function* approveSaga(a: ReturnType<typeof approveGalleryItemRequest>): Generator {
    try { yield call(apiApprove, a.payload.id, a.payload.reviewNote); yield put(galleryWorkflowSuccess()); } catch (e) { yield put(galleryWorkflowFailure(errMsg(e, "Approve failed — check consent"))); }
}
function* rejectSaga(a: ReturnType<typeof rejectGalleryItemRequest>): Generator {
    try { yield call(apiReject, a.payload.id, a.payload.reviewNote); yield put(galleryWorkflowSuccess()); } catch (e) { yield put(galleryWorkflowFailure(errMsg(e, "Reject failed"))); }
}
function* publishSaga(a: ReturnType<typeof publishGalleryItemRequest>): Generator {
    try { yield call(apiPublish, a.payload); yield put(galleryWorkflowSuccess()); } catch (e) { yield put(galleryWorkflowFailure(errMsg(e, "Publish failed — check consent"))); }
}

export default function* gallerySaga() {
    yield takeLatest(fetchGalleryRequest.type, fetchListSaga);
    yield takeLatest(fetchGalleryItemByIdRequest.type, fetchByIdSaga);
    yield takeLatest(createGalleryItemRequest.type, createSaga);
    yield takeLatest(updateGalleryItemRequest.type, updateSaga);
    yield takeLatest(deleteGalleryItemRequest.type, deleteSaga);
    yield takeLatest(submitGalleryItemRequest.type, submitSaga);
    yield takeLatest(approveGalleryItemRequest.type, approveSaga);
    yield takeLatest(rejectGalleryItemRequest.type, rejectSaga);
    yield takeLatest(publishGalleryItemRequest.type, publishSaga);
}
