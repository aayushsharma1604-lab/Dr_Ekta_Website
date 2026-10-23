/**
 * Models index - exports all models for easy importing
 */
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const ClinicInfo = require('./ClinicInfo');
const MediaAsset = require('./MediaAsset');
const Treatment = require('./Treatment');
const Article = require('./Article');
const Lead = require('./Lead');
const BookingProviderConfig = require('./BookingProviderConfig');
const Profile = require('./Profile');
const Testimonial = require('./Testimonial');
const GalleryItem = require('./GalleryItem');
const Video = require('./Video');
const CuratedPost = require('./CuratedPost');
const HomepageConfig = require('./HomepageConfig');
const RedirectMap = require('./RedirectMap');
const AnalyticsEvent = require('./AnalyticsEvent');
const Announcement = require('./Announcement');
const Location = require('./Location');
const TeamMember = require('./TeamMember');

module.exports = {
  User,
  RefreshToken,
  ClinicInfo,
  MediaAsset,
  Treatment,
  Article,
  Lead,
  BookingProviderConfig,
  Profile,
  Testimonial,
  GalleryItem,
  Video,
  CuratedPost,
  HomepageConfig,
  RedirectMap,
  AnalyticsEvent,
  Announcement,
  Location,
  TeamMember
};