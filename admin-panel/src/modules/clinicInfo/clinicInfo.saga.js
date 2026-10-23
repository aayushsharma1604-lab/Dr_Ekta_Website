import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { fetchRequest, fetchSuccess, fetchFailure, updateRequest, updateSuccess, updateFailure } from './clinicInfo.slice';
import { toast } from 'sonner';

function* fetchClinicInfo() {
  try {
    const res = yield call(api.get, '/api/clinic-info');
    yield put(fetchSuccess(res.data));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || e.message;
    const details = data?.details ? `: ${data.details.map((d) => `${d.field} ${d.message}`).join(', ')}` : '';
    toast.error(msg + details);
    yield put(fetchFailure(msg));
  }
}

function* updateClinicInfo(action) {
  try {
    // payload is exact ClinicInfo fields: practiceName, address, phones, timings, mapCoordinates, socialLinks, legalEntityName, email
    const res = yield call(api.put, '/api/clinic-info', action.payload);
    yield put(updateSuccess(res.data));
    toast.success('Clinic information updated');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || e.message;
    if (data?.details) {
      toast.error(data.details.map((d) => `${d.field}: ${d.message}`).join(', '));
    } else {
      toast.error(msg);
    }
    yield put(updateFailure(msg));
  }
}

export default function* clinicInfoSaga() {
  yield all([
    takeLatest(fetchRequest.type, fetchClinicInfo),
    takeLatest(updateRequest.type, updateClinicInfo),
  ]);
}
