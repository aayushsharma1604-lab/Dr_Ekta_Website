/**
 * Dev seed: fills the local (in-memory) MongoDB with realistic clinic data
 * so public pages have content. Idempotent - safe to run repeatedly.
 *
 * Usage: SEED_ADMIN_PASSWORD=<password> node scripts/seed-dev.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const ClinicInfo = require("../src/models/ClinicInfo");
const Treatment = require("../src/models/Treatment");
const TeamMember = require("../src/models/TeamMember");
const Testimonial = require("../src/models/Testimonial");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dr_ekta_db";

const ADMIN = {
  name: "Dr. Ekta Narula",
  email: process.env.SEED_ADMIN_EMAIL || "admin@drektanarula.in",
  password: process.env.SEED_ADMIN_PASSWORD,
};

const CLINIC = {
  singleton: "clinic_info",
  practiceName: "Dr. Ekta Narula Dental Care",
  legalEntityName: "Dr. Ekta Narula Dental Care",
  email: "contact@drektanarula.in",
  address: {
    street: "2nd Floor, Greater Kailash Market",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110048",
    country: "India",
  },
  phones: ["+91 93103 78836"],
  timings: [
    { day: "monday", open: "10:00", close: "19:30", isClosed: false },
    { day: "tuesday", open: "10:00", close: "19:30", isClosed: false },
    { day: "wednesday", open: "10:00", close: "19:30", isClosed: false },
    { day: "thursday", open: "10:00", close: "19:30", isClosed: false },
    { day: "friday", open: "10:00", close: "19:30", isClosed: false },
    { day: "saturday", open: "10:00", close: "18:00", isClosed: false },
    { day: "sunday", open: "10:00", close: "14:00", isClosed: true },
  ],
  mapCoordinates: { latitude: 28.5494, longitude: 77.242 },
  socialLinks: [
    { platform: "instagram", url: "https://www.instagram.com/drektanarula" },
  ],
};

const TREATMENTS = [
  {
    slug: "dental-implants",
    title: "Dental Implants",
    icon: "screw",
    problems: ["Missing one or more teeth", "Loose dentures", "Difficulty chewing", "Bone loss after extraction"],
    benefits: ["Permanent, fixed replacement", "Bites like a natural tooth", "Stops bone loss", "No clipping of adjacent teeth"],
    sections: {
      what: "A dental implant is a titanium root placed in the jawbone that supports a crown, bridge or denture.",
      who: "Adults with one or more missing teeth and healthy gums. Diabetes and smoking are assessed case by case.",
      procedure: "3D evaluation, implant placement under local anaesthesia, 8–12 weeks of healing, then a custom crown.",
      pain: "Done under local anaesthesia; mild soreness for 2–3 days managed with routine painkillers.",
      recovery: "Most patients return to work the next day. Full healing before the crown takes 8–12 weeks.",
      duration: "45–60 minutes per implant; the crown is fitted after healing.",
      whyDrEkta: "15+ years of implant experience, CBCT-guided planning and transparent pricing before treatment starts.",
    },
    faqs: [
      { question: "How long do implants last?", answer: "With good hygiene and regular reviews, implants typically last 15–25 years or more." },
      { question: "Does the implant hurt?", answer: "Placement is done under local anaesthesia. Most patients report less pain than an extraction." },
    ],
  },
  {
    slug: "root-canal-treatment",
    title: "Root Canal Treatment",
    icon: "tooth",
    problems: ["Deep cavity reaching the nerve", "Night-time toothache", "Swelling near the tooth", "Sensitivity to hot and cold"],
    benefits: ["Saves the natural tooth", "Pain relief within a day or two", "Chewing restored", "Single-visit option for many cases"],
    sections: {
      what: "Root canal treatment removes infected pulp from inside the tooth, disinfects the canals and seals them.",
      who: "Anyone with an infected or badly decayed tooth that can still be saved rather than extracted.",
      procedure: "Local anaesthesia, cleaning and shaping of canals, disinfection, and filling. A crown is recommended afterwards.",
      pain: "Modern rotary endodontics makes this comfortable; the tooth is numb throughout.",
      recovery: "Mild tenderness for 2–3 days when biting, then normal.",
      duration: "45–90 minutes; many cases finish in one sitting.",
      whyDrEkta: "Rotary and magnification-driven endodontics with high success rates on previously failed root canals.",
    },
    faqs: [
      { question: "Is a crown necessary after a root canal?", answer: "For molars and premolars, yes - a crown prevents the treated tooth from cracking." },
    ],
  },
  {
    slug: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    icon: "sparkles",
    problems: ["Yellow or stained teeth", "Chipped edges", "Small gaps (diastema)", "Worn, uneven smile line"],
    benefits: ["Natural-looking results", "Customised shade matching", "Conservative enamel-friendly options", "Fast transformation"],
    sections: {
      what: "Cosmetic dentistry covers whitening, veneers, composite bonding and micro-recontouring to improve how your smile looks.",
      who: "Anyone unhappy with the colour, shape or proportion of visible teeth.",
      procedure: "Smile analysis and photo planning, shade selection, then whitening, bonding or veneers as planned.",
      pain: "All procedures are painless; veneer preparation needs only mild numbing.",
      recovery: "None. You eat normally the same day.",
      duration: "Whitening takes about an hour; veneers need 2–3 visits.",
      whyDrEkta: "Cosmetic & prosthetic dental specialist with 15+ years and a photo-first planning process.",
    },
    faqs: [
      { question: "Will veneers look fake?", answer: "No. We match translucency, shade and shape against your face proportions during a trial smile." },
    ],
  },
  {
    slug: "smile-makeovers",
    title: "Smile Makeovers",
    icon: "smile",
    problems: ["Multiple cosmetic concerns at once", "Crooked and stained teeth", "Gummy smile", "Old fillings showing when you smile"],
    benefits: ["A single integrated plan", "Digital preview before work starts", "Colour, shape and alignment corrected together", "Long-lasting materials"],
    sections: {
      what: "A smile makeover combines whitening, veneers, recontouring and sometimes aligners into one planned transformation.",
      who: "Patients who want a complete smile redesign rather than fixing one tooth at a time.",
      procedure: "Photo and digital smile design, wax-up preview, then staged treatment over 3–6 weeks.",
      pain: "Mostly painless; numbing wherever preparation is done.",
      recovery: "Normal activities continue throughout.",
      duration: "3–6 weeks end to end, depending on the stage count.",
      whyDrEkta: "Digital smile design preview means you approve the outcome before permanent work begins.",
    },
    faqs: [
      { question: "Can I see the result before starting?", answer: "Yes - the wax-up and photo mock-up show the planned smile first." },
    ],
  },
  {
    slug: "teeth-whitening",
    title: "Teeth Whitening",
    icon: "sun",
    problems: ["Tea, coffee and paan stains", "Yellowing with age", "Dull smile before an event", "Fluorosis patches"],
    benefits: ["Visibly whiter in one sitting", "Safe on enamel", "Results last 6–18 months", "In-clinic and at-home options"],
    sections: {
      what: "In-clinic whitening uses a professional-grade gel activated with light to lift deep stains safely.",
      who: "Adults with healthy teeth and gums who want a brighter smile without veneers.",
      procedure: "Shade recording, gum protection, gel application under light, then a home top-up kit if desired.",
      pain: "None; mild momentary sensitivity for 24 hours afterwards is possible.",
      recovery: "Avoid very hot or very cold food for the rest of the day.",
      duration: "About 60 minutes in clinic.",
      whyDrEkta: "Shade-matched, sensitivity-aware whitening with a documented before-and-after record.",
    },
    faqs: [
      { question: "How white will my teeth get?", answer: "Typically 2–4 shades lighter, depending on stain depth. The result is photographed for comparison." },
    ],
  },
  {
    slug: "clear-aligners",
    title: "Clear Aligners",
    icon: "align",
    problems: ["Crooked front teeth", "Gaps between teeth", "Relapsed braces result", "Crowding"],
    benefits: ["Nearly invisible", "Removable for meals", "Digital result preview", "Fewer clinic visits than braces"],
    sections: {
      what: "Clear aligners are a sequence of transparent trays that move teeth to a digitally planned final position.",
      who: "Teens and adults with mild to moderate misalignment comfortable wearing trays 20–22 hours a day.",
      procedure: "Digital scans, a 3D treatment simulation, tray delivery, and reviews every 6–8 weeks.",
      pain: "Pressure for a day or two when each new tray starts; no wires or ulcers.",
      recovery: "No recovery needed; speech adjusts in 1–2 days.",
      duration: "6–18 months depending on the case, with 20–40 trays.",
      whyDrEkta: "In-house scanning and simulation so you can see the planned result on day one.",
    },
    faqs: [
      { question: "Can I eat with aligners on?", answer: "No - remove them for meals, rinse, and put them back after brushing." },
    ],
  },
  {
    slug: "crowns-and-bridges",
    title: "Crowns & Bridges",
    icon: "crown",
    problems: ["Cracked or root-treated teeth", "Large old fillings", "One or more missing teeth", "Worn-down enamel"],
    benefits: ["Strength restores full chewing", "Shade-matched ceramics", "Zirconia and E-max options", "Protects cracked teeth"],
    sections: {
      what: "Crowns cap and protect damaged teeth; bridges replace missing teeth by anchoring onto neighbouring teeth.",
      who: "Teeth after root canals, cracks, or large fillings, and gaps unsuitable for implants.",
      procedure: "Tooth preparation, digital or traditional impressions, a temporary crown, then the final crown in 5–7 days.",
      pain: "Preparation is done under local anaesthesia; tenderness settles within days.",
      recovery: "Normal chewing once the final crown is cemented.",
      duration: "Two visits about a week apart.",
      whyDrEkta: "Full-contour zirconia crowns with a 5-year workmanship follow-up.",
    },
    faqs: [
      { question: "How long do crowns last?", answer: "Well-maintained zirconia crowns commonly serve 10–15 years." },
    ],
  },
  {
    slug: "gum-care",
    title: "Gum Care",
    icon: "leaf",
    problems: ["Bleeding while brushing", "Swollen, red gums", "Bad breath", "Loose teeth in advanced cases"],
    benefits: ["Bleeding stops within days", "Fresh breath restored", "Teeth kept firm for life", "Systemic risk reduced"],
    sections: {
      what: "Gum treatment (scaling, root planing and periodontal therapy) treats gingivitis and periodontitis.",
      who: "Anyone with bleeding gums, recession, or drifting teeth; diabetics especially benefit.",
      procedure: "Charting and X-rays, ultrasonic scaling, root planing, then 3–6 month maintenance visits.",
      pain: "Comfortable; sensitive areas can be numbed on request.",
      recovery: "Gums remain tender for 1–2 days after deep cleaning.",
      duration: "30–60 minutes per session.",
      whyDrEkta: "Phase-based periodontal protocol with photographic tracking at each visit.",
    },
    faqs: [
      { question: "Why do my gums bleed if I brush twice a day?", answer: "Bleeding usually means plaque below the gumline that a brush cannot reach - it needs professional cleaning." },
    ],
  },
  {
    slug: "childrens-dentistry",
    title: "Children's Dentistry",
    icon: "childcare",
    problems: ["Cavities in milk teeth", "Fear of the dental chair", "Thumb sucking habit", "Teething complaints"],
    benefits: ["Painless first visits", "Habit correction", "Fluoride & sealant protection", "Positive long-term dental attitude"],
    sections: {
      what: "Child-focused preventive and restorative care - check-ups, fluoride, sealants, pulpectomies and habit counselling.",
      who: "Children from the first tooth, ideally every 6 months.",
      procedure: "Tell-show-do introduction, examination, cleaning or filling only when needed, and parent guidance.",
      pain: "Visits are built to be painless; cavities are numbed gently.",
      recovery: "Immediate; child eats normally after treatment.",
      duration: "20–40 minutes per visit.",
      whyDrEkta: "A dedicated child flow with a no-rush first visit designed to build trust.",
    },
    faqs: [
      { question: "Why fix milk teeth if they will fall out?", answer: "Milk teeth guide the permanent ones in place and affect speech and nutrition - early cavities need treatment." },
    ],
  },
  {
    slug: "preventive-dentistry",
    title: "Preventive Dentistry",
    icon: "shield",
    problems: ["Routine check-up due", "Mild sensitivity", "Plaque and tartar build-up", "Unclear brushing technique"],
    benefits: ["Problems caught early", "Lower lifetime dental cost", "Scale & polish included", "Personal brushing coaching"],
    sections: {
      what: "Six-monthly examinations, professional cleaning, fluoride applications and early intervention.",
      who: "Every adult and child, even with no pain - prevention works precisely when nothing hurts.",
      procedure: "Full-mouth examination, photographs, scaling and polishing, fluoride where indicated, and a written plan.",
      pain: "None; scaling feels like tickling pressure.",
      recovery: "None.",
      duration: "30–45 minutes per visit.",
      whyDrEkta: "Photo-documented reviews so you can see what changed between visits.",
    },
    faqs: [
      { question: "How often should I visit?", answer: "Every 6 months for a check-up and cleaning, unless we advise otherwise." },
    ],
  },
  {
    slug: "wisdom-tooth-treatment",
    title: "Wisdom Tooth Treatment",
    icon: "molar",
    problems: ["Impacted wisdom tooth", "Recurrent pericoronitis", "Jaw stiffness", "Food trapping behind last molar"],
    benefits: ["Ends recurring swelling", "Protects neighbouring molar", "Sterile surgical protocol", "Quick, managed recovery"],
    sections: {
      what: "Surgical removal of impacted or infected third molars under local anaesthesia, guided by imaging.",
      who: "Anyone with pain, repeated infections, or an X-ray showing an impacted wisdom tooth.",
      procedure: "Imaging and difficulty assessment, sterile removal under anaesthesia, absorbable sutures, follow-up at 5–7 days.",
      pain: "Numb during surgery; 2–4 days of swelling managed with medication.",
      recovery: "Soft diet and no smoking for 72 hours; sutures dissolve or are removed within a week.",
      duration: "20–45 minutes per tooth.",
      whyDrEkta: "Minor-oral-surgery trained hands with a documented sterile protocol and low complication rate.",
    },
    faqs: [
      { question: "Can both sides be removed the same day?", answer: "Often yes, when both need removal - it reduces total time off work." },
    ],
  },
  {
    slug: "full-mouth-rehabilitation",
    title: "Full Mouth Rehabilitation",
    icon: "rehab",
    problems: ["Most teeth worn or missing", "Collapsed bite height", "Chronic jaw or muscle pain", "Failing old dentistry"],
    benefits: ["One integrated plan", "Bite height rebuilt", "Fixed or removable options", "Staged, budgeted treatment"],
    sections: {
      what: "Systematic restoration of all upper and lower teeth to rebuild function, comfort and appearance.",
      who: "Patients with severe wear, multiple missing teeth, or long-standing bite collapse.",
      procedure: "Full records (impressions, X-rays, photos), a diagnostic wax-up, staged treatment of implants, crowns, bridges or dentures.",
      pain: "Each stage is done under anaesthesia; mild soreness between stages.",
      recovery: "Progressive; most routines continue between staged visits.",
      duration: "6 weeks to 6 months, depending on the stages involved.",
      whyDrEkta: "Prosthodontic specialisation with a written stage-by-stage plan and cost map before starting.",
    },
    faqs: [
      { question: "Is it done in one appointment?", answer: "No - it is staged: records first, then treatment in planned phases so the bite stays stable." },
    ],
  },
];

const TEAM = [
  {
    slug: "dr-ekta-narula",
    name: "Dr. Ekta Narula",
    role: "Founder & Lead Dentist",
    category: "cosmetic",
    experienceYears: 15,
    bio: "Gold Medalist dentist with 15+ years of experience in cosmetic, prosthetic and implant dentistry. Leads the clinic's smile design and full-mouth rehabilitation work.",
    qualifications: [{ degree: "BDS (Gold Medalist)", institution: "Faculty of Dental Sciences, KG Medical College" }],
    languages: ["English", "Hindi"],
    services: ["Smile makeovers", "Dental implants", "Crowns & bridges", "Full mouth rehabilitation"],
    reviews: [
      { patientName: "Ritika S.", rating: 5, text: "Explained every step and my veneers look completely natural." },
      { patientName: "Anand M.", rating: 5, text: "Got my full-mouth work done in planned stages. My bite finally feels right." },
    ],
  },
  {
    slug: "dr-u-arora",
    name: "Dr. U Arora",
    role: "Orthodontist",
    category: "orthodontics",
    experienceYears: 13,
    bio: "Orthodontist with 13+ years of experience in braces and clear aligners for teens and adults.",
    qualifications: [{ degree: "MDS Orthodontics" }],
    languages: ["English", "Hindi"],
    services: ["Braces", "Clear aligners", "Retainers"],
  },
  {
    slug: "dr-bhupesh-gupta",
    name: "Dr. Bhupesh Gupta",
    role: "Endodontist",
    category: "endodontics",
    experienceYears: 10,
    bio: "Root canal specialist with 10+ years of experience, including previously failed or difficult canals.",
    qualifications: [{ degree: "MDS Conservative Dentistry & Endodontics" }],
    languages: ["English", "Hindi"],
    services: ["Root canal treatment", "Re-treatment", "Post & core"],
  },
  {
    slug: "dr-manav-ahuja",
    name: "Dr. Manav Ahuja",
    role: "Oral & Maxillofacial Surgeon",
    category: "oral-surgery",
    experienceYears: 10,
    bio: "Oral and maxillofacial surgeon handling wisdom teeth, implants and jaw surgeries.",
    qualifications: [{ degree: "MDS Oral & Maxillofacial Surgery" }],
    languages: ["English", "Hindi"],
    services: ["Wisdom tooth removal", "Implant surgery", "Jaw procedures"],
  },
  {
    slug: "dr-anil-yadav",
    name: "Dr. Anil Yadav",
    role: "Periodontist & Implantologist",
    category: "periodontics",
    experienceYears: 15,
    bio: "15+ years of experience treating gum disease and placing dental implants with a phase-based protocol.",
    qualifications: [{ degree: "MDS Periodontics" }],
    languages: ["English", "Hindi"],
    services: ["Gum treatment", "Dental implants", "Bone grafting"],
  },
];

const TESTIMONIALS = [
  {
    patientDisplayName: "Ritika Sharma",
    content: "I was terrified of dentists before coming here. Dr. Ekta explained the whole plan with photos, and my root canal was completely painless. Six months on, the crown still feels perfect.",
  },
  {
    patientDisplayName: "Rajat Malhotra",
    content: "Got two implants placed after a failed bridge elsewhere. The boardwalk from planning to final crown was 10 weeks and everything was transparent on cost. Chewing is back to normal.",
  },
  {
    patientDisplayName: "Megha Kapoor",
    content: "My aligner treatment finished in 8 months. The team showed me the simulated result on day one, and the final smile matches almost exactly. Booking reminders on WhatsApp were genuinely useful.",
  },
  {
    patientDisplayName: "Farah N.",
    content: "My daughter's first dental visit here turned a crying three-year-old into a cooperative one. The staff never rushed her, and her two cavities are now sealed and sorted.",
  },
];

async function main() {
  if (!ADMIN.password) {
    throw new Error("SEED_ADMIN_PASSWORD must be set before running the dev seed.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("[seed] connected:", MONGODB_URI);

  // Admin user (upsert by email)
  const existingUser = await User.findOne({ email: ADMIN.email });
  if (!existingUser) {
    await User.create({ name: ADMIN.name, email: ADMIN.email, passwordHash: ADMIN.password });
    console.log("[seed] admin user created:", ADMIN.email);
  } else {
    console.log("[seed] admin user exists:", ADMIN.email);
  }

  // ClinicInfo singleton (upsert)
  await ClinicInfo.findOneAndUpdate({ singleton: CLINIC.singleton }, CLINIC, { upsert: true, new: true });
  console.log("[seed] clinic info upserted");

  // Treatments (upsert by slug)
  for (const t of TREATMENTS) {
    const doc = {
      ...t,
      status: "published",
      publishedAt: new Date(),
    };
    const existing = await Treatment.findOne({ slug: t.slug });
    if (existing) {
      existing.set(doc);
      await existing.save();
      existing.constructor.statics;
    } else {
      const admin = await User.findOne({ email: ADMIN.email });
      doc.createdBy = admin._id;
      await Treatment.create(doc);
    }
  }
  console.log(`[seed] ${TREATMENTS.length} treatments upserted`);

  // Team (upsert by slug)
  for (const m of TEAM) {
    await TeamMember.findOneAndUpdate(
      { slug: m.slug },
      { ...m, status: "published", publishedAt: new Date() },
      { upsert: true, new: true }
    );
  }
  console.log(`[seed] ${TEAM.length} team members upserted`);

  // Testimonials (upsert by patient name)
  for (const tm of TESTIMONIALS) {
    const existing = await Testimonial.findOne({ patientDisplayName: tm.patientDisplayName });
    if (!existing) {
      await Testimonial.create({ ...tm, type: "text", status: "published", publishedAt: new Date() });
    }
  }
  console.log(`[seed] ${TESTIMONIALS.length} testimonials ensured`);

  await mongoose.disconnect();
  console.log("[seed] done");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
