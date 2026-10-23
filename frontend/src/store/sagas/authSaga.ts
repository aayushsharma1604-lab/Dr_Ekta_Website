import { call, put, takeLatest } from "redux-saga/effects";
import { login as apiLogin, logout as apiLogout } from "@/lib/api";
import { clearTokens } from "@/lib/api/client";
import {
    loginRequest, loginSuccess, loginFailure,
    logoutRequest, logoutSuccess, logoutFailure,
} from "../slices/authSlice";
import type { LoginResponse } from "@/lib/api/types";

function* loginSaga(action: ReturnType<typeof loginRequest>): Generator {
    try {
        const { email, password } = action.payload;
        const data = (yield call(apiLogin, email, password)) as LoginResponse;
        yield put(loginSuccess({ user: data.user }));
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        yield put(loginFailure(message));
    }
}

function* logoutSaga(): Generator {
    try {
        yield call(apiLogout);
        yield put(logoutSuccess());
    } catch (error) {
        yield call(clearTokens);
        const message = error instanceof Error ? error.message : "Logout failed";
        yield put(logoutFailure(message));
    }
}

export default function* authSaga() {
    yield takeLatest(loginRequest.type, loginSaga);
    yield takeLatest(logoutRequest.type, logoutSaga);
}
