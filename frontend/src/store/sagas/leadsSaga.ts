import { call, put, takeLatest } from "redux-saga/effects";
import { getLeads, getLeadById, updateLead as apiUpdate, deleteLead as apiDelete, getLeadStats, exportLeads as apiExport } from "@/lib/api/services/leads";
import {
    fetchLeadsRequest, fetchLeadsSuccess, fetchLeadsFailure,
    fetchLeadByIdRequest, fetchLeadByIdSuccess, fetchLeadByIdFailure,
    fetchLeadStatsRequest, fetchLeadStatsSuccess, fetchLeadStatsFailure,
    updateLeadRequest, updateLeadSuccess, updateLeadFailure,
    deleteLeadRequest, deleteLeadSuccess, deleteLeadFailure,
    exportLeadsRequest,
} from "../slices/leadsSlice";
import type { Lead, PagedResponse, LeadStats } from "@/lib/api/types";

const errMsg = (e: unknown, f: string) => (e instanceof Error ? e.message : f);

function* fetchListSaga(action: ReturnType<typeof fetchLeadsRequest>): Generator {
    try { const data = (yield call(getLeads, action.payload)) as PagedResponse<Lead>; yield put(fetchLeadsSuccess(data)); }
    catch (e) { yield put(fetchLeadsFailure(errMsg(e, "Failed to load leads"))); }
}

function* fetchByIdSaga(action: ReturnType<typeof fetchLeadByIdRequest>): Generator {
    try { const data = (yield call(getLeadById, action.payload)) as Lead; yield put(fetchLeadByIdSuccess(data)); }
    catch (e) { yield put(fetchLeadByIdFailure(errMsg(e, "Lead not found"))); }
}

function* fetchStatsSaga(action: ReturnType<typeof fetchLeadStatsRequest>): Generator {
    try { const data = (yield call(getLeadStats, action.payload)) as LeadStats; yield put(fetchLeadStatsSuccess(data)); }
    catch (e) { yield put(fetchLeadStatsFailure(errMsg(e, "Failed to load lead stats"))); }
}

function* updateSaga(action: ReturnType<typeof updateLeadRequest>): Generator {
    try { const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as Lead; yield put(updateLeadSuccess(data)); }
    catch (e) { yield put(updateLeadFailure(errMsg(e, "Failed to update lead"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteLeadRequest>): Generator {
    try { yield call(apiDelete, action.payload); yield put(deleteLeadSuccess()); }
    catch (e) { yield put(deleteLeadFailure(errMsg(e, "Failed to delete lead"))); }
}

function* exportSaga(action: ReturnType<typeof exportLeadsRequest>): Generator {
    try {
        const csv = (yield call(apiExport, action.payload)) as string;
        // Trigger browser download
        if (typeof window !== "undefined") {
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch { /* CSV export is best-effort */ }
}

export default function* leadsSaga() {
    yield takeLatest(fetchLeadsRequest.type, fetchListSaga);
    yield takeLatest(fetchLeadByIdRequest.type, fetchByIdSaga);
    yield takeLatest(fetchLeadStatsRequest.type, fetchStatsSaga);
    yield takeLatest(updateLeadRequest.type, updateSaga);
    yield takeLatest(deleteLeadRequest.type, deleteSaga);
    yield takeLatest(exportLeadsRequest.type, exportSaga);
}
