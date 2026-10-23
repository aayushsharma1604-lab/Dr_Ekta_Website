import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchReportsRequest, fetchReportsSuccess, fetchReportsFailure,
  fetchEventsRequest, fetchEventsSuccess, fetchEventsFailure,
  request, success, failure,
} from './analytics.slice';

function* fetchReports(action) {
  try {
    const params = action.payload || {};
    // GET /api/analytics/reports/monthly?startDate&endDate
    const res = yield call(api.get, '/api/analytics/reports/monthly', { params });
    const data = res.data?.data ?? res.data;
    yield put(fetchReportsSuccess(data));
    yield put(success(data));
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    if (e.response?.data?.details) toast.error(e.response.data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else if (e.response?.status !== 401) toast.error(msg);
    yield put(fetchReportsFailure(msg));
    yield put(failure(msg));
  }
}

function* fetchEvents(action) {
  try {
    const params = action.payload || {};
    // GET /api/analytics/events?page&limit&eventType&startDate&endDate
    const res = yield call(api.get, '/api/analytics/events', { params });
    const data = res.data?.data ?? res.data;
    // normalize: backend may return PagedResponse {items, pagination}
    const normalized = data?.items ? data : { items: Array.isArray(data) ? data : [], pagination: data?.pagination ?? null };
    yield put(fetchEventsSuccess(data));
    yield put(success(data));
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    if (e.response?.data?.details) toast.error(e.response.data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else if (e.response?.status !== 401) toast.error(msg);
    yield put(fetchEventsFailure(msg));
    yield put(failure(msg));
  }
}

export default function* analyticsSaga() {
  yield all([
    takeLatest(fetchReportsRequest.type, fetchReports),
    takeLatest(fetchEventsRequest.type, fetchEvents),
    // backward compat: generic request -> fetch events (most common list)
    takeLatest(request.type, fetchEvents),
  ]);
}
