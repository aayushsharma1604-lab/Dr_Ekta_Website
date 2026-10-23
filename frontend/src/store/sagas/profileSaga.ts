import { call, put, takeLatest } from "redux-saga/effects";
import { getProfile, updateProfile as apiUpdate } from "@/lib/api";
import { fetchProfileRequest, fetchProfileSuccess, fetchProfileFailure, updateProfileRequest, updateProfileSuccess, updateProfileFailure } from "../slices/profileSlice";
import type { Profile } from "@/lib/api/types";

function* fetchSaga(): Generator {
    try { const data = (yield call(getProfile)) as Profile; yield put(fetchProfileSuccess(data)); }
    catch (e) { yield put(fetchProfileFailure(e instanceof Error ? e.message : "Failed to load profile")); }
}

function* updateSaga(action: ReturnType<typeof updateProfileRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload)) as Profile; yield put(updateProfileSuccess(data)); }
    catch (e) { yield put(updateProfileFailure(e instanceof Error ? e.message : "Failed to update profile")); }
}

export default function* profileSaga() {
    yield takeLatest(fetchProfileRequest.type, fetchSaga);
    yield takeLatest(updateProfileRequest.type, updateSaga);
}
