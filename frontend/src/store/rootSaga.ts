import { all, fork } from "redux-saga/effects";
import authSaga from "./sagas/authSaga";
import clinicSaga from "./sagas/clinicSaga";
import treatmentsSaga from "./sagas/treatmentsSaga";
import articlesSaga from "./sagas/articlesSaga";
import testimonialsSaga from "./sagas/testimonialsSaga";
import gallerySaga from "./sagas/gallerySaga";
import videosSaga from "./sagas/videosSaga";
import instagramSaga from "./sagas/instagramSaga";
import homeSaga from "./sagas/homeSaga";
import profileSaga from "./sagas/profileSaga";
import bookingSaga from "./sagas/bookingSaga";
import enquirySaga from "./sagas/enquirySaga";
import leadsSaga from "./sagas/leadsSaga";
import mediaSaga from "./sagas/mediaSaga";
import reviewQueueSaga from "./sagas/reviewQueueSaga";

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(clinicSaga),
    fork(treatmentsSaga),
    fork(articlesSaga),
    fork(testimonialsSaga),
    fork(gallerySaga),
    fork(videosSaga),
    fork(instagramSaga),
    fork(homeSaga),
    fork(profileSaga),
    fork(bookingSaga),
    fork(enquirySaga),
    fork(leadsSaga),
    fork(mediaSaga),
    fork(reviewQueueSaga),
  ]);
}
