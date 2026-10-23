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
} from './team.slice';

function* fetchList(action) {
  try {
    const params = action.payload || {};
    const res = yield call(api.get, '/api/team', { params });
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
    const res = yield call(api.get, `/api/team/${id}`);
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
    const res = yield call(api.post, '/api/team', action.payload);
    yield put(createSuccess(res.data));
    yield put(setItem(res.data));
    toast.success('Team member created');
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
    const payload = { ...body };
    delete payload.id; delete payload._id;
    const res = yield call(api.put, `/api/team/${_id}`, payload);
    yield put(updateSuccess(res.data));
    yield put(setItem(res.data));
    toast.success('Team member updated');
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
    yield call(api.delete, `/api/team/${id}`);
    yield put(deleteSuccess());
    toast.success('Team member deleted');
    yield put(fetchListRequest({}));
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(deleteFailure(msg));
    yield put(failure(msg));
  }
}

export default function* teamSaga() {
  yield all([
    takeLatest(fetchListRequest.type, fetchList),
    takeLatest(fetchOneRequest.type, fetchOne),
    takeLatest(createRequest.type, create),
    takeLatest(updateRequest.type, update),
    takeLatest(deleteRequest.type, del),
    takeLatest(request.type, fetchList),
  ]);
}
