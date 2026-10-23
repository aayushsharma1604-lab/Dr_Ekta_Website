import { combineReducers } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import authReducer from "./slices/authSlice";
import clinicReducer from "./slices/clinicSlice";
import treatmentsReducer from "./slices/treatmentsSlice";
import articlesReducer from "./slices/articlesSlice";
import testimonialsReducer from "./slices/testimonialsSlice";
import galleryReducer from "./slices/gallerySlice";
import videosReducer from "./slices/videosSlice";
import instagramReducer from "./slices/instagramSlice";
import homeReducer from "./slices/homeSlice";
import profileReducer from "./slices/profileSlice";
import bookingReducer from "./slices/bookingSlice";
import enquiryReducer from "./slices/enquirySlice";
import leadsReducer from "./slices/leadsSlice";
import mediaReducer from "./slices/mediaSlice";
import reviewQueueReducer from "./slices/reviewQueueSlice";

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  clinic: clinicReducer,
  treatments: treatmentsReducer,
  articles: articlesReducer,
  testimonials: testimonialsReducer,
  gallery: galleryReducer,
  videos: videosReducer,
  instagram: instagramReducer,
  home: homeReducer,
  profile: profileReducer,
  booking: bookingReducer,
  enquiry: enquiryReducer,
  leads: leadsReducer,
  media: mediaReducer,
  reviewQueue: reviewQueueReducer,
});

export default rootReducer;
