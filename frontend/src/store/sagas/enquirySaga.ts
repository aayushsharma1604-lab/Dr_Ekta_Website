import { call, put, takeLatest } from "redux-saga/effects";
import { submitEnquiry as apiSubmit } from "@/lib/api";
import { submitEnquiryRequest, submitEnquirySuccess, submitEnquiryFailure } from "../slices/enquirySlice";
import type { EnquiryResponse } from "@/lib/api/types";

function* submitSaga(action: ReturnType<typeof submitEnquiryRequest>): Generator {
    try {
        const data = (yield call(apiSubmit, action.payload)) as EnquiryResponse;
        yield put(submitEnquirySuccess(data));
    } catch (e) {
        yield put(submitEnquiryFailure(e instanceof Error ? e.message : "Failed to submit enquiry"));
    }
}

export default function* enquirySaga() {
    yield takeLatest(submitEnquiryRequest.type, submitSaga);
}
