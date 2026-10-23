import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { fetchRequest, fetchSuccess, fetchFailure, updateRequest, updateSuccess, updateFailure } from './profile.slice';
import { toast } from 'sonner';

function* fetchProfile() {
  try {
    const res = yield call(api.get, '/api/profile');
    const data = res.data?.data ?? res.data;
    yield put(fetchSuccess(data));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    const details = data?.details ? `: ${data.details.map((d) => `${d.field}: ${d.message}`).join(', ')}` : '';
    toast.error(msg + details);
    yield put(fetchFailure(msg));
  }
}

function* updateProfile(action) {
  try {
    // payload is exact Profile whitelist: qualifications [{degree, institution, year}], memberships [{organization, role, since}], awards [{title, issuer, year}], mediaAppearances [{outlet, title, date, url}], publications [{title, journal, year, url}] (years 1950-2030), plus photo (MediaAsset id), video (MediaAsset id), bio (String)
    const res = yield call(api.put, '/api/profile', action.payload);
    const data = res.data?.data ?? res.data;
    yield put(updateSuccess(data));
    toast.success('Profile updated');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    if (data?.details) {
      toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    } else {
      toast.error(msg);
    }
    yield put(updateFailure(msg));
  }
}

export default function* profileSaga() {
  yield all([
    takeLatest(fetchRequest.type, fetchProfile),
    takeLatest(updateRequest.type, updateProfile),
  ]);
}
