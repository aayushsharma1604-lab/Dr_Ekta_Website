import { call, put, takeLatest } from "redux-saga/effects";
import { listMedia, getMediaUploadUrl, confirmMediaUpload, deleteMedia as apiDelete } from "@/lib/api/services/media";
import {
    fetchMediaRequest, fetchMediaSuccess, fetchMediaFailure,
    getUploadUrlRequest, getUploadUrlSuccess, getUploadUrlFailure,
    confirmUploadRequest, confirmUploadSuccess, confirmUploadFailure,
    deleteMediaRequest, deleteMediaSuccess, deleteMediaFailure,
} from "../slices/mediaSlice";
import type { MediaAsset, PagedResponse, MediaUploadResponse } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchMediaRequest>): Generator {
    try { const data = (yield call(listMedia, action.payload)) as PagedResponse<MediaAsset>; yield put(fetchMediaSuccess(data)); }
    catch (e) { yield put(fetchMediaFailure(errMsg(e, "Failed to load media"))); }
}

function* getUploadUrlSaga(action: ReturnType<typeof getUploadUrlRequest>): Generator {
    try { const data = (yield call(getMediaUploadUrl, action.payload)) as MediaUploadResponse; yield put(getUploadUrlSuccess(data)); }
    catch (e) { yield put(getUploadUrlFailure(errMsg(e, "Failed to get upload URL"))); }
}

function* confirmUploadSaga(action: ReturnType<typeof confirmUploadRequest>): Generator {
    try { const data = (yield call(confirmMediaUpload, action.payload)) as MediaAsset; yield put(confirmUploadSuccess(data)); }
    catch (e) { yield put(confirmUploadFailure(errMsg(e, "Failed to confirm upload"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteMediaRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteMediaSuccess()); }
    catch (e) { yield put(deleteMediaFailure(errMsg(e, "Failed to delete media"))); }
}

export default function* mediaSaga() {
    yield takeLatest(fetchMediaRequest.type, fetchListSaga);
    yield takeLatest(getUploadUrlRequest.type, getUploadUrlSaga);
    yield takeLatest(confirmUploadRequest.type, confirmUploadSaga);
    yield takeLatest(deleteMediaRequest.type, deleteSaga);
}
