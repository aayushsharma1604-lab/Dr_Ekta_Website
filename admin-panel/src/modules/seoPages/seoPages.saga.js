import { takeLatest, all, put } from 'redux-saga/effects';
import { success } from './seoPages.slice';

// seoPages is a local page-builder with no backend API (public SEO is sitemap/robots, not admin).
// Keep saga as no-op to avoid 404s if actions are dispatched.
// All state is managed locally in the component (useState) — slice exists only for potential future wiring.

function* fetchListNoop() {
  // No API call — pages are local state in seoPages.tsx
  yield put(success([]));
}

export default function* seoPagesSaga() {
  yield all([
    takeLatest('seoPages/request', fetchListNoop),
    takeLatest('seoPages/fetchOne', fetchListNoop),
    takeLatest('seoPages/create', fetchListNoop),
    takeLatest('seoPages/update', fetchListNoop),
    takeLatest('seoPages/delete', fetchListNoop),
  ]);
}
