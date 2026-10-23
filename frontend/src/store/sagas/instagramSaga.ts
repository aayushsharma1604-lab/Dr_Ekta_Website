import { call, put, takeLatest } from "redux-saga/effects";
import { getInstagramPosts, createInstagramPost as apiCreate, updateInstagramPost as apiUpdate, deleteInstagramPost as apiDelete } from "@/lib/api";
import {
    fetchInstagramRequest, fetchInstagramSuccess, fetchInstagramFailure,
    createInstagramPostRequest, createInstagramPostSuccess, createInstagramPostFailure,
    updateInstagramPostRequest, updateInstagramPostSuccess, updateInstagramPostFailure,
    deleteInstagramPostRequest, deleteInstagramPostSuccess, deleteInstagramPostFailure,
} from "../slices/instagramSlice";
import type { CuratedPost, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchInstagramRequest>): Generator {
    try { const data = (yield call(getInstagramPosts, action.payload)) as PagedResponse<CuratedPost>; yield put(fetchInstagramSuccess(data)); }
    catch (e) { yield put(fetchInstagramFailure(errMsg(e, "Failed to load Instagram posts"))); }
}
function* createSaga(action: ReturnType<typeof createInstagramPostRequest>): Generator {
    try { const data = (yield call(apiCreate, action.payload)) as CuratedPost; yield put(createInstagramPostSuccess(data)); }
    catch (e) { yield put(createInstagramPostFailure(errMsg(e, "Failed to create post"))); }
}
function* updateSaga(action: ReturnType<typeof updateInstagramPostRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as CuratedPost; yield put(updateInstagramPostSuccess(data)); }
    catch (e) { yield put(updateInstagramPostFailure(errMsg(e, "Failed to update post"))); }
}
function* deleteSaga(action: ReturnType<typeof deleteInstagramPostRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteInstagramPostSuccess()); }
    catch (e) { yield put(deleteInstagramPostFailure(errMsg(e, "Failed to delete post"))); }
}

export default function* instagramSaga() {
    yield takeLatest(fetchInstagramRequest.type, fetchListSaga);
    yield takeLatest(createInstagramPostRequest.type, createSaga);
    yield takeLatest(updateInstagramPostRequest.type, updateSaga);
    yield takeLatest(deleteInstagramPostRequest.type, deleteSaga);
}
