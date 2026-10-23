import { call, put, takeLatest } from "redux-saga/effects";
import { getClinicInfo, updateClinicInfo as apiUpdateClinic } from "@/lib/api";
import {
    fetchClinicRequest, fetchClinicSuccess, fetchClinicFailure,
    updateClinicRequest, updateClinicSuccess, updateClinicFailure,
} from "../slices/clinicSlice";
import type { ClinicInfo } from "@/lib/api/types";

function* fetchClinicSaga(): Generator {
    try {
        const data = (yield call(getClinicInfo)) as ClinicInfo;
        yield put(fetchClinicSuccess(data));
    } catch (error) {
        yield put(fetchClinicFailure(error instanceof Error ? error.message : "Failed to load clinic info"));
    }
}

function* updateClinicSaga(action: ReturnType<typeof updateClinicRequest>): Generator {
    try {
        const data = (yield call(apiUpdateClinic, action.payload)) as ClinicInfo;
        yield put(updateClinicSuccess(data));
    } catch (error) {
        yield put(updateClinicFailure(error instanceof Error ? error.message : "Failed to update clinic info"));
    }
}

export default function* clinicSaga() {
    yield takeLatest(fetchClinicRequest.type, fetchClinicSaga);
    yield takeLatest(updateClinicRequest.type, updateClinicSaga);
}
