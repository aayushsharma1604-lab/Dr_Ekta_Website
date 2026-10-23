import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchListRequest, fetchListSuccess, fetchListFailure,
  fetchOneRequest, fetchOneSuccess, fetchOneFailure,
  createRequest, createSuccess, createFailure,
  updateRequest, updateSuccess, updateFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  request, success, failure, setItem,
} from './redirects.slice';

function* fetchList(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/redirects', { params });
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
    const res = yield call(api.get, `/api/redirects/${id}`);
    const payload = res.data?.data ?? res.data;
    yield put(fetchOneSuccess(payload));
    yield put(setItem(payload));
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    toast.error(msg);
    yield put(fetchOneFailure(msg));
    yield put(failure(msg));
  }
}

function* create(action) {
  try {
    const payload = {
      fromPath: action.payload.fromPath,
      toPath: action.payload.toPath,
      statusCode: action.payload.statusCode ?? 301,
    };
    const res = yield call(api.post, '/api/redirects', payload);
    const data = res.data?.data ?? res.data;
    yield put(createSuccess(data));
    yield put(setItem(data));
    toast.success('Redirect created');
    // refresh list
    yield put(fetchListRequest({}));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    const isDuplicate = e.response?.status === 409 || data?.code === 'DUPLICATE_REDIRECT';
    if (isDuplicate) {
      toast.error(msg || 'Redirect for this path already exists');
    } else if (data?.details) {
      toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    } else {
      toast.error(msg);
    }
    yield put(createFailure(msg));
    yield put(failure(msg));
  }
}

function* update(action) {
  try {
    const { id, _id, data, ...rest } = action.payload || {};
    const targetId = id ?? _id ?? action.payload?.id ?? action.payload?._id;
    // only allow toPath and statusCode per API spec (fromPath immutable)
    const body = data ?? rest;
    const payload = {};
    if (body.toPath !== undefined) payload.toPath = body.toPath;
    if (body.statusCode !== undefined) payload.statusCode = body.statusCode;
    // if payload came with id but no toPath/statusCode, fallback to extracting those fields directly
    if (Object.keys(payload).length === 0) {
      if (action.payload.toPath !== undefined) payload.toPath = action.payload.toPath;
      if (action.payload.statusCode !== undefined) payload.statusCode = action.payload.statusCode;
    }
    const res = yield call(api.put, `/api/redirects/${targetId}`, payload);
    const result = res.data?.data ?? res.data;
    yield put(updateSuccess(result));
    yield put(setItem(result));
    toast.success('Redirect updated');
    yield put(fetchListRequest({}));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    else toast.error(msg);
    yield put(updateFailure(msg));
    yield put(failure(msg));
  }
}

function* del(action) {
  try {
    const id = action.payload?.id ?? action.payload;
    yield call(api.delete, `/api/redirects/${id}`);
    yield put(deleteSuccess());
    toast.success('Redirect deleted');
    yield put(fetchListRequest({}));
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    toast.error(msg);
    yield put(deleteFailure(msg));
    yield put(failure(msg));
  }
}

export default function* redirectsSaga() {
  yield all([
    takeLatest(fetchListRequest.type, fetchList),
    takeLatest(fetchOneRequest.type, fetchOne),
    takeLatest(createRequest.type, create),
    takeLatest(updateRequest.type, update),
    takeLatest(deleteRequest.type, del),
    takeLatest(request.type, fetchList),
  ]);
}
