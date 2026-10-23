import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  fetchRequest,
  fetchSuccess,
  fetchFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  fetchClicksRequest,
  fetchClicksSuccess,
  fetchClicksFailure,
} from './bookingProvider.slice';

function* fetchBookingProvider() {
  try {
    const res = yield call(api.get, '/api/booking-provider');
    yield put(fetchSuccess(res.data));
  } catch (e) {
    const status = e.response?.status;
    if (status === 404) {
      // not configured yet — treat as null without error toast
      yield put(fetchSuccess(null));
      return;
    }
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    const details = data?.details ? `: ${data.details.map((d) => `${d.field} ${d.message}`).join(', ')}` : '';
    toast.error(msg + details);
    yield put(fetchFailure(msg));
  }
}

function* updateBookingProvider(action) {
  try {
    const payload = action.payload || {};
    // providerName forced to "practo" when omitted — ensure default
    const body = {
      providerName: payload.providerName || 'practo',
      ...(payload.profileUrl !== undefined ? { profileUrl: payload.profileUrl } : {}),
      ...(payload.bookingUrl !== undefined ? { bookingUrl: payload.bookingUrl } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    };
    // include any extra fields if provided (forward as-is for flexibility)
    // but keep exact field names: providerName, profileUrl, bookingUrl, isActive
    const res = yield call(api.put, '/api/booking-provider', body);
    yield put(updateSuccess(res.data));
    toast.success('Booking provider updated');
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

function* fetchClicks(action) {
  try {
    const params = action.payload || {};
    // params may contain startDate, endDate — forwarded as query string
    const res = yield call(api.get, '/api/practo-clicks', { params });
    yield put(fetchClicksSuccess(res.data));
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    toast.error(msg);
    yield put(fetchClicksFailure(msg));
  }
}

export default function* bookingProviderSaga() {
  yield all([
    takeLatest(fetchRequest.type, fetchBookingProvider),
    takeLatest(updateRequest.type, updateBookingProvider),
    takeLatest(fetchClicksRequest.type, fetchClicks),
  ]);
}
