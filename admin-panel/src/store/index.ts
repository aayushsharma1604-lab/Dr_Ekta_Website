import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import authReducer from '@/modules/auth/auth.slice';
import authSaga from '@/modules/auth/auth.saga';
import clinicInfoReducer from '@/modules/clinicInfo/clinicInfo.slice';
import clinicInfoSaga from '@/modules/clinicInfo/clinicInfo.saga';
import treatmentsReducer from '@/modules/treatments/treatments.slice';
import treatmentsSaga from '@/modules/treatments/treatments.saga';
import articlesReducer from '@/modules/articles/articles.slice';
import articlesSaga from '@/modules/articles/articles.saga';
import testimonialsReducer from '@/modules/testimonials/testimonials.slice';
import testimonialsSaga from '@/modules/testimonials/testimonials.saga';
import galleryReducer from '@/modules/gallery/gallery.slice';
import gallerySaga from '@/modules/gallery/gallery.saga';
import videosReducer from '@/modules/videos/videos.slice';
import videosSaga from '@/modules/videos/videos.saga';
import instagramPostsReducer from '@/modules/instagramPosts/instagramPosts.slice';
import instagramPostsSaga from '@/modules/instagramPosts/instagramPosts.saga';
import leadsReducer from '@/modules/leads/leads.slice';
import leadsSaga from '@/modules/leads/leads.saga';
import mediaReducer from '@/modules/media/media.slice';
import mediaSaga from '@/modules/media/media.saga';
import homepageReducer from '@/modules/homepage/homepage.slice';
import homepageSaga from '@/modules/homepage/homepage.saga';
import profileReducer from '@/modules/profile/profile.slice';
import profileSaga from '@/modules/profile/profile.saga';
import redirectsReducer from '@/modules/redirects/redirects.slice';
import redirectsSaga from '@/modules/redirects/redirects.saga';
import bookingProviderReducer from '@/modules/bookingProvider/bookingProvider.slice';
import bookingProviderSaga from '@/modules/bookingProvider/bookingProvider.saga';
import analyticsReducer from '@/modules/analytics/analytics.slice';
import analyticsSaga from '@/modules/analytics/analytics.saga';
import teamReducer from '@/modules/team/team.slice';
import teamSaga from '@/modules/team/team.saga';

function* rootSaga() {
  yield all([authSaga(), clinicInfoSaga(), treatmentsSaga(), articlesSaga(), testimonialsSaga(), gallerySaga(), videosSaga(), instagramPostsSaga(), leadsSaga(), mediaSaga(), homepageSaga(), profileSaga(), redirectsSaga(), bookingProviderSaga(), analyticsSaga(), teamSaga()]);
}

export const makeStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      auth: authReducer,
      clinicInfo: clinicInfoReducer,
      treatments: treatmentsReducer,
      articles: articlesReducer,
      testimonials: testimonialsReducer,
      gallery: galleryReducer,
      videos: videosReducer,
      instagramPosts: instagramPostsReducer,
      leads: leadsReducer,
      media: mediaReducer,
      homepage: homepageReducer,
      profile: profileReducer,
      redirects: redirectsReducer,
      bookingProvider: bookingProviderReducer,
      analytics: analyticsReducer,
      team: teamReducer,
    },
    middleware: (getDefault) => getDefault({ thunk: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(rootSaga);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
