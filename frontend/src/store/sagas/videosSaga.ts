import { call, put, takeLatest } from "redux-saga/effects";
import { getVideos, getAdminVideoById, createVideo as apiCreate, updateVideo as apiUpdate, deleteVideo as apiDelete } from "@/lib/api";
import {
    fetchVideosRequest, fetchVideosSuccess, fetchVideosFailure,
    fetchVideoByIdRequest, fetchVideoByIdSuccess, fetchVideoByIdFailure,
    createVideoRequest, createVideoSuccess, createVideoFailure,
    updateVideoRequest, updateVideoSuccess, updateVideoFailure,
    deleteVideoRequest, deleteVideoSuccess, deleteVideoFailure,
} from "../slices/videosSlice";
import type { Video, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchVideosRequest>): Generator {
    try { const data = (yield call(getVideos, action.payload)) as PagedResponse<Video>; yield put(fetchVideosSuccess(data)); }
    catch (e) { yield put(fetchVideosFailure(errMsg(e, "Failed to load videos"))); }
}
function* fetchByIdSaga(action: ReturnType<typeof fetchVideoByIdRequest>): Generator {
    try { const data = (yield call(getAdminVideoById, action.payload)) as Video; yield put(fetchVideoByIdSuccess(data)); }
    catch (e) { yield put(fetchVideoByIdFailure(errMsg(e, "Video not found"))); }
}
function* createSaga(action: ReturnType<typeof createVideoRequest>): Generator {
    try { const data = (yield call(apiCreate, action.payload)) as Video; yield put(createVideoSuccess(data)); }
    catch (e) { yield put(createVideoFailure(errMsg(e, "Failed to create video"))); }
}
function* updateSaga(action: ReturnType<typeof updateVideoRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as Video; yield put(updateVideoSuccess(data)); }
    catch (e) { yield put(updateVideoFailure(errMsg(e, "Failed to update video"))); }
}
function* deleteSaga(action: ReturnType<typeof deleteVideoRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteVideoSuccess()); }
    catch (e) { yield put(deleteVideoFailure(errMsg(e, "Failed to delete video"))); }
}

export default function* videosSaga() {
    yield takeLatest(fetchVideosRequest.type, fetchListSaga);
    yield takeLatest(fetchVideoByIdRequest.type, fetchByIdSaga);
    yield takeLatest(createVideoRequest.type, createSaga);
    yield takeLatest(updateVideoRequest.type, updateSaga);
    yield takeLatest(deleteVideoRequest.type, deleteSaga);
}
