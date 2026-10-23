import { call, put, takeLatest, fork } from "redux-saga/effects";
import { getBookingCTA, logPractoClick, getBookingProvider, updateBookingProvider as apiUpdate, getPractoClicks } from "@/lib/api";
import {
    fetchBookingCtaRequest, fetchBookingCtaSuccess, fetchBookingCtaFailure,
    logPractoClickRequest,
    fetchBookingProviderRequest, fetchBookingProviderSuccess, fetchBookingProviderFailure,
    updateBookingProviderRequest, updateBookingProviderSuccess, updateBookingProviderFailure,
    fetchPractoClicksRequest, fetchPractoClicksSuccess, fetchPractoClicksFailure,
} from "../slices/bookingSlice";
import type { BookingCTA, BookingProviderConfig } from "@/lib/api/types";

function* fetchCtaSaga(): Generator {
    try { const data = (yield call(getBookingCTA)) as BookingCTA; yield put(fetchBookingCtaSuccess(data)); }
    catch (e) { yield put(fetchBookingCtaFailure(e instanceof Error ? e.message : "No active booking provider")); }
}

// Fire-and-forget — never fails
function* logClickSaga(): Generator {
    try { yield call(logPractoClick); } catch { /* always 200 */ }
}

function* fetchProviderSaga(): Generator {
    try { const data = (yield call(getBookingProvider)) as BookingProviderConfig; yield put(fetchBookingProviderSuccess(data)); }
    catch (e) { yield put(fetchBookingProviderFailure(e instanceof Error ? e.message : "Failed to load booking provider")); }
}

function* updateProviderSaga(action: ReturnType<typeof updateBookingProviderRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload)) as BookingProviderConfig; yield put(updateBookingProviderSuccess(data)); }
    catch (e) { yield put(updateBookingProviderFailure(e instanceof Error ? e.message : "Failed to update")); }
}

function* fetchClicksSaga(action: ReturnType<typeof fetchPractoClicksRequest>): Generator {
    try {
        const data = (yield call(getPractoClicks, action.payload)) as { totalClicks: number; dailyStats: Array<{ _id: string; count: number }> };
        yield put(fetchPractoClicksSuccess(data));
    } catch (e) { yield put(fetchPractoClicksFailure(e instanceof Error ? e.message : "Failed to load click stats")); }
}

export default function* bookingSaga() {
    yield takeLatest(fetchBookingCtaRequest.type, fetchCtaSaga);
    yield takeLatest(logPractoClickRequest.type, function* () { yield fork(logClickSaga); });
    yield takeLatest(fetchBookingProviderRequest.type, fetchProviderSaga);
    yield takeLatest(updateBookingProviderRequest.type, updateProviderSaga);
    yield takeLatest(fetchPractoClicksRequest.type, fetchClicksSaga);
}
