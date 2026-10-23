import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  createRequest, createSuccess, createFailure,
  updateRequest, updateSuccess, updateFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  request, success, failure, setItem,
} from './videos.slice';

function* fetchList(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/videos', { params });
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

function* fetchOne(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    const res = yield call(api.get, `/api/videos/${id}`);
    yield put(fetchOneSuccess(res.data));
    yield put(setItem(res.data));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(fetchOneFailure(msg));
    yield put(failure(msg));
  }
}

function* create(action) {
  try {
    const res = yield call(api.post, '/api/videos', action.payload);
    yield put(createSuccess(res.data));
    yield put(setItem(res.data));
    toast.success('Video created');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(createFailure(msg));
    yield put(failure(msg));
  }
}

function* update(action) {
  try {
    const { id, ...rest } = action.payload || {};
    const _id = id ?? action.payload?.id ?? action.payload?._id;
    const body = rest && Object.keys(rest).length ? rest : action.payload;
    const partial = { ...body }; delete partial.id; delete partial._id;
    // PUT validator is create-shaped: requires url, title, category. Merge with existing item if partial.
    const existing = yield select((s) => s.videos?.item);
    const base = existing && (existing._id === _id || existing.id === _id) ? existing : null;
    // If backend item is wrapped as {data: ...}, unwrap
    const baseData = base?.data ?? base;
    const merged = { ...(baseData || {}), ...partial };
    // Ensure required fields; if still missing, fetch the full object first
    let payload = { url: merged.url, title: merged.title, category: merged.category, ...partial };
    // Include optional fields from merged if not overridden
    if (merged.thumbnail !== undefined && payload.thumbnail === undefined) payload.thumbnail = merged.thumbnail;
    if (merged.order !== undefined && payload.order === undefined) payload.order = merged.order;
    if (merged.status !== undefined && payload.status === undefined) payload.status = merged.status;
    if (merged.transcript !== undefined && payload.transcript === undefined) payload.transcript = merged.transcript;
    if (merged.captionsUrl !== undefined && payload.captionsUrl === undefined) payload.captionsUrl = merged.captionsUrl;
    // If any required still missing and we didn't have base, fetch from API then merge
    if ((!payload.url || !payload.title || !payload.category) && !base) {
      try {
        const fetched = yield call(api.get, `/api/videos/${_id}`);
        const fetchedData = fetched.data?.data ?? fetched.data;
        payload = { url: fetchedData.url, title: fetchedData.title, category: fetchedData.category, ...fetchedData, ...partial };
        delete payload._id; delete payload.id; delete payload.__v;
        // ensure required present after fetch
        if (!payload.url || !payload.title || !payload.category) throw new Error('Missing required fields');
      } catch (fetchErr) {
        // fall back to partial; let backend 422 surface
      }
    }
    // sanitize: remove system fields
    delete payload._id; delete payload.id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt;
    const res = yield call(api.put, `/api/videos/${_id}`, payload);
    yield put(updateSuccess(res.data));
    yield put(setItem(res.data));
    toast.success('Video updated');
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
    yield call(api.delete, `/api/videos/${id}`);
    yield put(deleteSuccess());
    toast.success('Video deleted');
    yield put(fetchListRequest({}));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(deleteFailure(msg));
    yield put(failure(msg));
  }
}

export default function* videosSaga() {
  yield all([
    takeLatest(fetchListRequest.type, fetchList),
    takeLatest(fetchOneRequest.type, fetchOne),
    takeLatest(createRequest.type, create),
    takeLatest(updateRequest.type, update),
    takeLatest(deleteRequest.type, del),
    takeLatest(request.type, fetchList),
  ]);
}
