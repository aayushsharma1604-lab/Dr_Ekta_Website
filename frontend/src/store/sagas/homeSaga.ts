import { call, put, takeLatest } from "redux-saga/effects";
import { getHome, getHomepageConfig, updateHomepageConfig as apiUpdate } from "@/lib/api";
import {
    fetchHomeRequest, fetchHomeSuccess, fetchHomeFailure,
    fetchHomeConfigRequest, fetchHomeConfigSuccess, fetchHomeConfigFailure,
    updateHomeConfigRequest, updateHomeConfigSuccess, updateHomeConfigFailure,
} from "../slices/homeSlice";
import type { HomepageAggregate, HomepageConfig } from "@/lib/api/types";

function* fetchHomeSaga(): Generator {
    try { const data = (yield call(getHome)) as HomepageAggregate; yield put(fetchHomeSuccess(data)); }
    catch (e) { yield put(fetchHomeFailure(e instanceof Error ? e.message : "Failed to load homepage")); }
}

function* fetchConfigSaga(): Generator {
    try { const data = (yield call(getHomepageConfig)) as HomepageConfig; yield put(fetchHomeConfigSuccess(data)); }
    catch (e) { yield put(fetchHomeConfigFailure(e instanceof Error ? e.message : "Failed to load homepage config")); }
}

function* updateConfigSaga(action: ReturnType<typeof updateHomeConfigRequest>): Generator {
    try { const data = (yield call(() => apiUpdate(action.payload as Parameters<typeof apiUpdate>[0]))) as HomepageConfig; yield put(updateHomeConfigSuccess(data)); }
    catch (e) { yield put(updateHomeConfigFailure(e instanceof Error ? e.message : "Failed to update homepage config")); }
}

export default function* homeSaga() {
    yield takeLatest(fetchHomeRequest.type, fetchHomeSaga);
    yield takeLatest(fetchHomeConfigRequest.type, fetchConfigSaga);
    yield takeLatest(updateHomeConfigRequest.type, updateConfigSaga);
}
