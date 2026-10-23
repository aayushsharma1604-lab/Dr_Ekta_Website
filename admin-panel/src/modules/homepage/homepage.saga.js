import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchConfigRequest,
  fetchConfigSuccess,
  fetchConfigFailure,
  updateConfigRequest,
  updateConfigSuccess,
  updateConfigFailure,
  fetchConfig,
  updateConfig,
} from './homepage.slice';

function* fetchConfigSaga() {
  try {
    const res = yield call(api.get, '/api/home/config');
    const data = res.data?.data ?? res.data;
    yield put(fetchConfigSuccess(data));
  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || e.message;
    if (e.response?.data?.details) {
      toast.error(e.response.data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    } else {
      toast.error(msg);
    }
    yield put(fetchConfigFailure(msg));
  }
}

function* updateConfigSaga(action) {
  try {
    // payload is exact HomepageConfig: { featuredTreatments, featuredArticles, featuredVideos, featuredTestimonials } as arrays of ObjectIds (strings)
    const payload = action.payload || {};
    const res = yield call(api.put, '/api/home/config', payload);
    const data = res.data?.data ?? res.data;
    yield put(updateConfigSuccess(data));
    toast.success('Homepage config updated');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) {
      toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    } else {
      toast.error(msg);
    }
    yield put(updateConfigFailure(msg));
  }
}

export default function* homepageSaga() {
  yield all([
    takeLatest(fetchConfigRequest.type, fetchConfigSaga),
    takeLatest(fetchConfig.type, fetchConfigSaga),
    takeLatest(updateConfigRequest.type, updateConfigSaga),
    takeLatest(updateConfig.type, updateConfigSaga),
  ]);
}
