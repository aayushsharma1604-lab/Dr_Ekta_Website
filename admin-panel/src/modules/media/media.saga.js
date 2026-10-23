import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  uploadRequest, uploadSuccess, uploadFailure,
  confirmRequest, confirmSuccess, confirmFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  request, success, failure, setItem,
} from './media.slice';

function* fetchList(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/media', { params });
    yield put(fetchListSuccess(res.data));
    yield put(success(res.data));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(fetchListFailure(msg));
    yield put(failure(msg));
  }
}

function* fetchOne(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    const res = yield call(api.get, `/api/media/${id}`);
    const payload = res.data?.data ?? res.data;
    yield put(fetchOneSuccess(payload));
    yield put(setItem(payload));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(fetchOneFailure(msg));
    yield put(failure(msg));
  }
}

function* upload(action) {
  try {
    const payload = action.payload;
    const res = yield call(api.post, '/api/media/upload', payload);
    yield put(uploadSuccess(res.data));
    yield put(success(res.data));
    toast.success('Upload URL ready');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(uploadFailure(msg));
    yield put(failure(msg));
  }
}

function* confirm(action) {
  try {
    const payload = action.payload;
    const res = yield call(api.post, '/api/media/confirm', payload);
    const data = res.data?.data ?? res.data;
    yield put(confirmSuccess(data));
    yield put(setItem(data));
    toast.success('Media confirmed');
    // refresh list
    yield put(fetchListRequest({}));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(confirmFailure(msg));
    yield put(failure(msg));
  }
}

function* del(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    yield call(api.delete, `/api/media/${id}`);
    yield put(deleteSuccess());
    toast.success('Media deleted');
    yield put(fetchListRequest({}));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(deleteFailure(msg));
    yield put(failure(msg));
  }
}

export default function* mediaSaga() {
  yield all([
    takeLatest(fetchListRequest.type, fetchList),
    takeLatest(fetchOneRequest.type, fetchOne),
    takeLatest(uploadRequest.type, upload),
    takeLatest(confirmRequest.type, confirm),
    takeLatest(deleteRequest.type, del),
    takeLatest(request.type, fetchList),
  ]);
}
