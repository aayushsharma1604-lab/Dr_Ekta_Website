import { call, put, takeLatest, all } from 'redux-saga/effects';
import { api, setTokens, clearTokens } from '@/lib/api';
import { loginRequest, loginSuccess, loginFailure, logoutRequest, logoutSuccess, refreshRequest, refreshSuccess } from './auth.slice';
import { toast } from 'sonner';

function* login(action) {
  try {
    // payload is { email, password } — exact as backend wants
    const res = yield call(api.post, '/api/auth/login', action.payload);
    const data = res.data; // { user, accessToken, refreshToken }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    yield put(loginSuccess(data));
    toast.success('Welcome back!');
  } catch (e) {
    const data = e.response?.data;
    const msg = data?.error || data?.message || e.message;
    // 422 details already toasted via interceptor, but surface here as well
    if (data?.details) {
      const detailMsg = data.details.map((d) => `${d.field}: ${d.message}`).join(', ');
      toast.error(detailMsg);
      yield put(loginFailure(detailMsg));
    } else {
      toast.error(msg);
      yield put(loginFailure(msg));
    }
  }
}

function* refresh(action) {
  try {
    const payload = action.payload || {};
    // backend accepts { refreshToken } in body or httpOnly cookie
    const res = yield call(api.post, '/api/auth/refresh', payload.refreshToken ? { refreshToken: payload.refreshToken } : {});
    const data = res.data;
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    yield put(refreshSuccess(data));
    toast.success('Session refreshed');
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    toast.error(msg);
    yield put(loginFailure(msg));
  }
}

function* logout(action) {
  try {
    const rt = action.payload?.refreshToken;
    yield call(api.post, '/api/auth/logout', rt ? { refreshToken: rt } : {});
    toast.success('Logged out');
  } catch {
    // always clear locally even if server fails — per docs logout always 200
    toast.success('Logged out');
  } finally {
    clearTokens();
    yield put(logoutSuccess());
  }
}

export default function* authSaga() {
  yield all([
    takeLatest(loginRequest.type, login),
    takeLatest(refreshRequest.type, refresh),
    takeLatest(logoutRequest.type, logout),
  ]);
}
