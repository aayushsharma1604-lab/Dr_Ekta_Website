export const SITE_CONFIG = {
  name: "Dr. Ekta Narula Dental Care",
  description:
    "Dr. Ekta Narula is a trusted dental expert in New Delhi in her 25th year of experience in cosmetic dentistry, implants, root canals, and smile makeovers.",
  url: "https://drektanarula.com",
  ogImage: "/og-image.jpg",
  phone: "+919811013519",
  whatsapp: "919811013519",
  email: "info@drektanarula.com",
  address: {
    street: "R707, Block R, Rajender Nagar Part 1",
    area: "New Rajinder Nagar",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110060",
    country: "India",
  },
  clinicTimings: {
    morning: "09:00 AM - 02:00 PM",
    evening: "Closed",
    sunday: "Closed",
  },
  social: {
    instagram: "https://instagram.com/drektanarula",
    youtube: "https://youtube.com/@drektanarula",
    facebook: "#",
    google: "#",
    linkedin: "", // ponytail: empty until the client pastes the clinic LinkedIn URL
  },
  // ponytail: booking destination for every "Book Appointment" button.
  // The CMS booking provider (admin → Booking Provider) overrides this; paste
  // the live Practo/booking URL here when you have it.
  Practo: "/#book-appointment",
  googleMaps:
    "https://maps.google.com/?q=R707+Block+R+Rajender+Nagar+Part+1+New+Rajinder+Nagar+Delhi",
};

export const NAVIGATION = [
  { label: "Home", href: "/" },
  { label: "About Dr. Ekta", href: "/about" },
  { label: "About Clinic", href: "/about-clinic" },
  { label: "Treatments", href: "/treatments" },
  { label: "Our Team", href: "/team" },
  { label: "Patient Stories", href: "/testimonials" },
  { label: "Smile Gallery", href: "/gallery" },
  { label: "Knowledge Centre", href: "/knowledge" },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
];

export const TEAM_CATEGORIES = [
  { value: "general", label: "General Dentistry" },
  { value: "orthodontics", label: "Orthodontics" },
  { value: "endodontics", label: "Endodontics" },
  { value: "oral-surgery", label: "Oral Surgery" },
  { value: "periodontics", label: "Periodontics" },
  { value: "implantology", label: "Implantology" },
  { value: "prosthodontics", label: "Prosthodontics" },
  { value: "cosmetic", label: "Cosmetic Dentistry" },
  { value: "pediatric", label: "Pediatric Dentistry" },
] as const;

export function teamCategoryLabel(value: string): string {
  return TEAM_CATEGORIES.find((c) => c.value === value)?.label || value;
}

export const TREATMENTS = [
  {
    id: "dental-implants",
    title: "Dental Implants",
    description: "Permanent tooth replacement that looks and feels natural.",
    icon: "medical_services",
  },
  {
    id: "root-canal",
    title: "Root Canal Treatment",
    description: "Pain-free root canal to save damaged or infected teeth.",
    icon: "healing",
  },
  {
    id: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    description: "Transform your smile with advanced cosmetic procedures.",
    icon: "auto_awesome",
  },
  {
    id: "smile-makeovers",
    title: "Smile Makeovers",
    description: "Complete smile transformation tailored to you.",
    icon: "sentiment_very_satisfied",
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    description: "Professional whitening for a brighter, confident smile.",
    icon: "brightness_7",
  },
  {
    id: "clear-aligners",
    title: "Clear Aligners",
    description: "Straighten teeth discreetly with invisible aligners.",
    icon: "visibility",
  },
  {
    id: "crowns-bridges",
    title: "Crowns & Bridges",
    description: "Restore damaged teeth with natural-looking crowns and bridges.",
    icon: "domain",
  },
  {
    id: "gum-care",
    title: "Gum Care",
    description: "Expert treatment for healthy gums and lasting oral health.",
    icon: "favorite",
  },
  {
    id: "childrens-dentistry",
    title: "Children's Dentistry",
    description: "Gentle, friendly dental care for your little ones.",
    icon: "child_care",
  },
  {
    id: "preventive-dentistry",
    title: "Preventive Dentistry",
    description: "Keep your teeth healthy with regular check-ups and cleanings.",
    icon: "health_and_safety",
  },
  {
    id: "wisdom-tooth",
    title: "Wisdom Tooth Treatment",
    description: "Safe and comfortable wisdom tooth extraction.",
    icon: "medical_services",
  },
  {
    id: "full-mouth-rehabilitation",
    title: "Full Mouth Rehabilitation",
    description: "Comprehensive restoration for complete oral rehabilitation.",
    icon: "emoji_people",
  },
];

export const TEAM = [
  {
    name: "Dr. Ekta Narula",
    role: "Founder & Lead Dentist",
    qualifications: "BDS (Gold Medalist)",
    experience: "25th Year",
    specialization: "Cosmetic & Prosthetic Dentistry",
    residency: "MAMC, New Delhi",
    training: "Advanced Prosthetic Dentistry - Smile India, New Delhi",
  },
  {
    name: "Dr. U Arora",
    role: "Orthodontist",
    qualifications: "BDS, MDS (Gold Medalist - KGMC Lucknow)",
    experience: "13+ Years",
    specialization: "Braces & Aligners",
  },
  {
    name: "Dr. Bhupesh Gupta",
    role: "Endodontist",
    qualifications: "BDS, MDS (PGI Chandigarh)",
    experience: "10+ Years",
    specialization: "Root Canal Treatment",
  },
  {
    name: "Dr. Manav Ahuja",
    role: "Oral & Maxillofacial Surgeon",
    qualifications: "BDS, MDS (KLE Dental College)",
    experience: "10+ Years",
    specialization: "Wisdom Tooth & Jaw Surgeries",
  },
  {
    name: "Dr. Anil Yadav",
    role: "Periodontist & Implantologist",
    qualifications: "BDS, MDS",
    experience: "25th Year",
    specialization: "Gum Surgeries & Implants",
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Vanya Sili",
    role: "CTO at Gegera Inc",
    rating: 5,
    text: "This is one of the best dentist offices I've been to. The staff are super friendly and the doctors are professional and friendly as well. I love how high-tech and modern the office is!",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Software Engineer",
    rating: 5,
    text: "Dr. Ekta completely transformed my smile with veneers. I was nervous at first, but she explained everything so clearly. Now I can't stop smiling! The results are absolutely natural-looking.",
  },
  {
    id: 3,
    name: "Rahul Mehra",
    role: "Business Owner",
    rating: 5,
    text: "I had a severe fear of dentists until I visited Dr. Ekta. She was so patient and gentle that I didn't even feel the injection. My root canal was completely painless. Highly recommend!",
  },
  {
    id: 4,
    name: "Anjali Gupta",
    role: "Homemaker",
    rating: 5,
    text: "Both my children love visiting Dr. Ekta. She has a magical way of making kids feel comfortable. My son actually looks forward to his dental check-ups now. Thank you, Dr. Ekta!",
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Marketing Director",
    rating: 5,
    text: "Got my dental implants done by Dr. Ekta and the results are fantastic. It feels just like my natural teeth. The whole process was well-planned and smooth. Great experience!",
  },
  {
    id: 6,
    name: "Meera Joshi",
    role: "Professor",
    rating: 5,
    text: "Dr. Ekta's knowledge and expertise are outstanding. She took the time to explain every option and helped me make the best decision for my dental health. The clinic is spotless and modern.",
  },
];

export const CATEGORIES = [
  "Dental Care",
  "Oral Health",
  "Dental Implants",
  "Cosmetic Dentistry",
  "Children's Dental Health",
  "Gum Health",
  "Dental Myths",
  "Patient FAQs",
];

export const YOUTUBE_VIDEOS = [
  {
    id: "1",
    title: "What is a Dental Implant?",
    description: "Dr. Ekta explains the dental implant procedure step by step.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "5:30",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Root Canal — Pain Myths Busted",
    description: "Think root canals are painful? Dr. Ekta busts the most common myths.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "7:15",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "3",
    title: "How to Brush Your Teeth Properly",
    description: "The right brushing technique for a healthier smile.",
    youtubeId: "dQw4w9WgXcQ",
    duration: "4:00",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export const INSTAGRAM_POSTS = [
  { id: "1", shortcode: "ABC123", caption: "Smile transformation ✨" },
  { id: "2", shortcode: "DEF456", caption: "Happy patient after teeth whitening 😁" },
  { id: "3", shortcode: "GHI789", caption: "Behind the scenes at our clinic 🏥" },
  { id: "4", shortcode: "JKL012", caption: "Dental tips for kids 👶" },
  { id: "5", shortcode: "MNO345", caption: "Before & after veneers 😍" },
  { id: "6", shortcode: "PQR678", caption: "Meet our amazing team 💙" },
];

export const GALLERY_ITEMS = [
  { id: 1, treatment: "Dental Implants", type: "Before & After", before: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1606811841688-23dfddceeee8?q=80&w=600&auto=format&fit=crop" },
  { id: 2, treatment: "Teeth Whitening", type: "Before & After", before: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop", after: "https://images.unsplash.com/photo-1606811841688-23dfddceeee8?q=80&w=600&auto=format&fit=crop" },
];
