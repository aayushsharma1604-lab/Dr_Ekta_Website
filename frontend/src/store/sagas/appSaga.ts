import { call, put, takeLatest } from "redux-saga/effects";
import { setLoading, setError } from "../slices/appSlice";

function* fetchDataSaga(): Generator {
  try {
    yield put(setLoading(true));
    // Add your API calls here
    // const data = yield call(api.fetchData);
    yield put(setLoading(false));
  } catch (error) {
    yield put(setError("An error occurred"));
    yield put(setLoading(false));
  }
}

export default function* appSaga() {
  yield takeLatest("app/fetchData", fetchDataSaga);
}
