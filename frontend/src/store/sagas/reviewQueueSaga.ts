import { call, put, takeLatest } from "redux-saga/effects";
import { getReviewQueue } from "@/lib/api/services/reviewQueue";
import { fetchReviewQueueRequest, fetchReviewQueueSuccess, fetchReviewQueueFailure } from "../slices/reviewQueueSlice";
import type { ReviewQueueItem, PagedResponse } from "@/lib/api/types";

function* fetchSaga(action: ReturnType<typeof fetchReviewQueueRequest>): Generator {
    try {
        const data = (yield call(getReviewQueue, action.payload)) as PagedResponse<ReviewQueueItem>;
        yield put(fetchReviewQueueSuccess(data));
    } catch (e) {
        yield put(fetchReviewQueueFailure(e instanceof Error ? e.message : "Failed to load review queue"));
    }
}

export default function* reviewQueueSaga() {
    yield takeLatest(fetchReviewQueueRequest.type, fetchSaga);
}
