// Shared mock data factories — deterministic, realistic shapes per openapi.yaml

export const mockUser = {
  _id: 'user_001',
  email: 'admin@example.com',
  name: 'Dr Ekta Admin',
  role: 'admin',
};

export const mockTokens = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
};

export const mockTreatments = [
  {
    _id: 'treat_001',
    slug: 'dental-implant',
    title: 'Dental Implant',
    status: 'published' as const,
    sections: { what: 'What is implant', who: 'Who needs it' },
    faqs: [{ question: 'Pain?', answer: 'Minimal', order: 1 }],
    seo: { metaTitle: 'Dental Implant', metaDescription: 'Best implant' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    _id: 'treat_002',
    slug: 'root-canal',
    title: 'Root Canal',
    status: 'draft' as const,
    sections: { what: 'Root canal desc' },
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

export const mockArticles = [
  {
    _id: 'art_001',
    title: 'Preventive Care Guide',
    slug: 'preventive-care-guide',
    category: 'preventive-care',
    body: 'Full article body content here',
    author: 'Dr Ekta',
    status: 'published' as const,
    tags: ['dental', 'prevention'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    _id: 'art_002',
    title: 'Cosmetic Dentistry Trends',
    slug: 'cosmetic-dentistry-trends',
    category: 'cosmetic',
    body: 'Cosmetic body',
    author: 'Dr Ekta',
    status: 'draft' as const,
    tags: ['cosmetic'],
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

export const mockMediaAssets = [
  {
    _id: 'media_001',
    filename: 'hero.jpg',
    originalName: 'hero.jpg',
    url: 'https://res.cloudinary.com/demo/image/upload/hero.jpg',
    mimeType: 'image/jpeg',
    size: 102400,
    altText: 'Hero image',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'media_002',
    filename: 'gallery.png',
    originalName: 'gallery.png',
    url: 'https://res.cloudinary.com/demo/image/upload/gallery.png',
    mimeType: 'image/png',
    size: 204800,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export const mockClinicInfo = {
  _id: 'clinic_001',
  practiceName: 'Dr Ekta Dental Clinic',
  address: { street: '123 Main St', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
  phones: ['+919999999999'],
  email: 'clinic@example.com',
  timings: [{ day: 'Monday', open: '09:00', close: '18:00', isClosed: false }],
  mapCoordinates: { latitude: 28.6139, longitude: 77.209 },
  socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/drekta' }],
  legalEntityName: 'Dr Ekta Pvt Ltd',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const mockGalleryItems = [
  {
    _id: 'gal_001',
    beforeImg: 'media_001',
    afterImg: 'media_002',
    treatmentTag: 'dental-implant',
    content: 'Amazing transformation',
    status: 'published' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const mockBookingProvider = {
  _id: 'book_001',
  providerName: 'practo',
  profileUrl: 'https://practo.com/drekta',
  bookingUrl: 'https://practo.com/drekta/book',
  isActive: true,
};

export function paginated<T>(items: T[], page = 1, limit = 10) {
  return {
    items,
    pagination: { page, limit, total: items.length, pages: Math.ceil(items.length / limit) || 1 },
  };
}
