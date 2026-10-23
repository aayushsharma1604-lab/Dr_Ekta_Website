import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  updateRequest, updateSuccess, updateFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  request, success, failure, setItem,
} from './leads.slice';

function* fetchList(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/leads', { params });
    yield put(fetchListSuccess(res.data));
    yield put(success(res.data));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    if (e.response?.data?.details) toast.error(e.response.data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(fetchListFailure(msg));
    yield put(failure(msg));
  }
}

function* fetchStats(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/leads/stats', { params });
    yield put(fetchStatsSuccess(res.data));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(fetchStatsFailure(msg));
  }
}

function* fetchOne(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    const res = yield call(api.get, `/api/leads/${id}`);
    yield put(fetchOneSuccess(res.data));
    yield put(setItem(res.data));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(fetchOneFailure(msg));
    yield put(failure(msg));
  }
}

function* update(action) {
  try {
    const { id, ...rest } = action.payload || {};
    const _id = id ?? action.payload?.id ?? action.payload?._id;
    const body = rest && Object.keys(rest).length ? rest : action.payload;
    const payload = {};
    // only 4 writable per docs
    if (body.leadStatus !== undefined) payload.leadStatus = body.leadStatus;
    if (body.appointmentStatus !== undefined) payload.appointmentStatus = body.appointmentStatus;
    if (body.notes !== undefined) payload.notes = body.notes;
    if (body.treatmentInterest !== undefined) payload.treatmentInterest = body.treatmentInterest;
    const res = yield call(api.put, `/api/leads/${_id}`, payload);
    yield put(updateSuccess(res.data));
    yield put(setItem(res.data));
    toast.success('Lead updated');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(updateFailure(msg));
    yield put(failure(msg));
  }
}

function* del(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    yield call(api.delete, `/api/leads/${id}`);
    yield put(deleteSuccess());
    toast.success('Lead deleted');
    yield put(fetchListRequest({}));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(deleteFailure(msg));
    yield put(failure(msg));
  }
}

function* exportCsv(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/leads/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('CSV downloaded');
  } catch (e) {
    toast.error(e.response?.data?.error || e.message);
  }
}

export default function* leadsSaga() {
  yield all([
    takeLatest(fetchListRequest.type, fetchList),
    takeLatest(fetchStatsRequest.type, fetchStats),
    takeLatest(fetchOneRequest.type, fetchOne),
    takeLatest(updateRequest.type, update),
    takeLatest(deleteRequest.type, del),
    takeLatest('leads/export', exportCsv),
    takeLatest(request.type, fetchList),
  ]);
}
