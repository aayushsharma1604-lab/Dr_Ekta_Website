export interface TreatmentDetail {
  id: string;
  title: string;
  shortDescription: string;
  icon: string;
  whatIs: string;
  whoNeeds: string;
  problems: string[];
  benefits: string[];
  procedure: string;
  painful: string;
  duration: string;
  recovery: string;
  risks: string;
  expectations: string;
  whyDrEkta: string;
  faqs: { question: string; answer: string }[];
}

export const TREATMENT_DETAILS: TreatmentDetail[] = [
  {
    id: "dental-implants",
    title: "Dental Implants",
    shortDescription:
      "Permanent tooth replacement that looks, feels, and functions just like your natural teeth.",
    icon: "medical_services",
    whatIs:
      "Dental implants are the gold standard for replacing missing teeth. A dental implant is a small, biocompatible titanium post that is surgically placed into the jawbone beneath the gum line. Once in place, it acts as an artificial tooth root, providing a sturdy foundation for a replacement tooth — called a crown — that is custom-made to match your natural teeth in colour, shape, and size.\n\nUnlike dentures or bridges, implants are permanently fixed in your mouth. They don't slip, click, or require adhesives. Because they fuse directly with your jawbone through a process called osseointegration, they become a permanent part of your body — making them the closest thing to having your natural teeth back.\n\nDental implants can replace a single missing tooth, multiple missing teeth, or even support a full arch of replacement teeth (All-on-4 or All-on-6 implants). They are also used to anchor dentures securely, eliminating the discomfort of loose-fitting removable prosthetics.",
    whoNeeds:
      "You may be a good candidate for dental implants if you:\n\n• Have one or more missing teeth due to decay, injury, or gum disease\n• Are struggling with loose or ill-fitting dentures\n• Have difficulty chewing or speaking because of missing teeth\n• Have a sunken facial appearance caused by bone loss from missing teeth\n• Want a permanent, low-maintenance solution rather than removable appliances\n• Are in good general health with healthy gums and adequate jawbone density\n• Are committed to maintaining good oral hygiene and regular dental visits\n\nDr. Ekta will evaluate your jawbone density, gum health, and overall medical history during your consultation to determine if implants are the right option for you. In cases of significant bone loss, bone grafting procedures may be recommended before implant placement.",
    problems: [
      "Missing one or more teeth",
      "Difficulty chewing food properly",
      "Speech problems caused by gaps",
      "Bone loss in the jaw after tooth extraction",
      "Sunken or aged facial appearance",
      "Loose or uncomfortable dentures",
      "Reluctance to smile due to gaps",
      "Adjacent teeth shifting into empty spaces",
    ],
    benefits: [
      "Permanent, fixed solution — no slipping or adhesives",
      "Preserves jawbone and prevents further bone loss",
      "Looks and feels exactly like natural teeth",
      "Does not require alteration of adjacent healthy teeth",
      "With proper care, can last a lifetime",
      "Restores full chewing power — eat anything you want",
      "Boosts confidence and improves quality of life",
      "High success rate of over 95%",
    ],
    procedure:
      "The dental implant process is carried out in carefully planned stages to ensure the best results:\n\n**Step 1 — Comprehensive Consultation:** Dr. Ekta performs a detailed examination including digital X-rays and 3D cone-beam CT scans to assess your jawbone density, nerve positions, and sinus locations. A personalised treatment plan is created.\n\n**Step 2 — Implant Placement:** Under local anaesthesia (with sedation options if needed), a small incision is made in the gum and the titanium implant is precisely placed into the jawbone at the optimal angle and depth. The gum is then sutured closed over the implant.\n\n**Step 3 — Osseointegration (Healing Phase):** Over the next 3 to 6 months, the implant fuses with your natural jawbone through a biological process called osseointegration. This creates an incredibly strong and stable foundation.\n\n**Step 4 — Abutment Placement:** Once the implant has fully integrated, a small connector post called an abutment is attached to the implant. This protrudes above the gum line and serves as the anchor for the replacement tooth.\n\n**Step 5 — Custom Crown Placement:** Dr. Ekta takes precise impressions of your teeth and sends them to a dental laboratory where your custom-made crown is crafted to match your natural teeth in colour, shape, and size. Once ready, the crown is securely attached to the abutment.\n\nThe result is a tooth that looks, feels, and functions just like your own.",
    painful:
      "The implant placement procedure is performed under local anaesthesia, meaning the area is completely numb and you will not feel pain during the surgery. Many patients describe the sensation as similar to having a simple tooth extraction.\n\nFor patients who feel anxious about dental procedures, Dr. Ekta offers sedation options to help you relax completely during the treatment.\n\nAfter the anaesthesia wears off, you may experience mild discomfort, swelling, or bruising for a few days. This is completely normal and is easily managed with over-the-counter pain medication and cold compresses. Most patients are surprised at how little discomfort they experience after the procedure.",
    duration:
      "The entire implant journey typically spans 3 to 9 months, broken down as follows:\n\n• **Consultation and planning:** 1 visit (with X-rays and scans)\n• **Implant surgery:** 1 to 2 hours per implant\n• **Healing (osseointegration):** 3 to 6 months\n• **Abutment and crown placement:** 2 to 3 visits over 2 to 4 weeks\n\nIn some cases, a temporary crown can be placed on the same day as the implant (immediate loading), allowing you to walk out with a tooth on the day of surgery. Dr. Ekta will discuss the best approach for your specific situation.\n\nSingle implants are usually completed in 4 to 6 months. Full-arch restorations (All-on-4) can often be completed with teeth in a day.",
    recovery:
      "Recovery from dental implant surgery is straightforward for most patients:\n\n• **Day 1 to 3:** Mild swelling, bruising, and discomfort. Stick to soft foods and avoid disturbing the surgical site. Apply cold compresses to reduce swelling.\n• **Week 1:** Most swelling subsides. You can gradually return to normal eating. Stitches are typically removed or dissolve on their own.\n• **Week 2 to 4:** Soft tissue heals completely. You can resume most normal activities.\n• **3 to 6 months:** The implant fuses with the jawbone during this period. You can eat normally and the temporary restoration (if placed) functions like a natural tooth.\n\nDr. Ekta provides detailed aftercare instructions and is available for follow-up appointments to ensure smooth healing. Most patients return to work within 1 to 2 days of the procedure.",
    risks:
      "Dental implant surgery has a success rate of over 95%, making it one of the most predictable procedures in dentistry. However, as with any surgical procedure, there are some risks to be aware of:\n\n• **Infection at the implant site** — Preventable with proper oral hygiene and antibiotics\n• **Sinus issues** — Implants in the upper jaw may protrude into the sinus cavity (avoided with proper imaging and planning)\n• **Nerve damage** — Rare when placed by an experienced practitioner using 3D imaging\n• **Implant failure** — The implant may not integrate with the bone, particularly in smokers or patients with uncontrolled diabetes\n• **Bone insufficiency** — May require bone grafting before implant placement\n\nDr. Ekta uses advanced 3D imaging and computer-guided implant planning to minimise all these risks. Her thorough pre-operative assessment ensures that only suitable candidates proceed with implant treatment.",
    expectations:
      "Dental implants are the closest you can get to having your natural teeth back. Here is what you can expect:\n\n• **Appearance:** Your replacement tooth will look indistinguishable from your natural teeth. It is custom-made to match the colour, shape, and size of your surrounding teeth.\n• **Function:** You can eat, chew, bite, and speak normally — just as you would with natural teeth. There are no dietary restrictions.\n• **Comfort:** Because implants are fixed in your jaw, there is no rubbing, slipping, or discomfort associated with removable dentures.\n• **Maintenance:** Care for your implant just like a natural tooth — brush, floss, and visit Dr. Ekta for regular check-ups.\n• **Longevity:** With proper care, the implant itself can last a lifetime. The crown may need replacement after 10 to 15 years due to normal wear.\n• **Confidence:** Many patients report a significant boost in self-confidence after getting implants, as they no longer feel self-conscious about missing teeth.",
    whyDrEkta:
      "Dr. Ekta Narula brings over 15 years of clinical experience to implant dentistry. She has placed hundreds of implants successfully and stays at the forefront of implant technology through continuing education and advanced training.\n\nHer clinic is equipped with digital X-rays and 3D cone-beam CT scanners for precise implant planning, ensuring optimal placement angle, depth, and position. She works closely with Dr. Anil Yadav, a periodontist and implantologist with 15+ years of experience, for complex cases.\n\nFrom single-tooth replacements to full-arch restorations, Dr. Ekta provides personalised treatment plans tailored to each patient's unique needs, bone structure, and aesthetic goals.",
    faqs: [
      {
        question: "Are dental implants safe?",
        answer:
          "Yes, dental implants have a success rate of over 95% and are considered one of the safest and most predictable dental procedures. They have been used successfully for over 50 years worldwide. Dr. Ekta uses advanced imaging and planning to ensure the highest safety standards.",
      },
      {
        question: "How long do dental implants last?",
        answer:
          "The titanium implant itself can last a lifetime with proper care, as it fuses permanently with your jawbone. The porcelain crown attached to the implant typically lasts 10 to 15 years before it may need replacement due to normal wear. Good oral hygiene and regular dental check-ups significantly extend their lifespan.",
      },
      {
        question: "Can anyone get dental implants?",
        answer:
          "Most healthy adults with adequate jawbone density can receive implants. Factors that may affect eligibility include uncontrolled diabetes, heavy smoking, certain medications, insufficient bone density, and active gum disease. A thorough consultation with Dr. Ekta, including 3D imaging, will determine if you are a suitable candidate.",
      },
      {
        question: "How much do dental implants cost?",
        answer:
          "The cost varies depending on the number of implants needed, the type of restoration, and whether bone grafting is required. Dr. Ekta provides a detailed treatment plan with transparent pricing during your consultation. We also offer flexible payment options to make implant treatment accessible.",
      },
      {
        question: "What is the success rate of dental implants?",
        answer:
          "Dental implants have a success rate of over 95% in healthy patients. Factors that influence success include bone quality, oral hygiene, smoking status, and overall health. Dr. Ekta's thorough planning and advanced techniques contribute to consistently high success rates.",
      },
      {
        question: "Do I need bone grafting before implants?",
        answer:
          "Not always. If you have adequate jawbone density, implants can be placed directly. However, if significant bone loss has occurred (common after tooth loss or prolonged denture use), a bone graft may be needed to build up the jawbone before implant placement. Dr. Ekta will assess this during your consultation using 3D imaging.",
      },
    ],
  },
  {
    id: "root-canal",
    title: "Root Canal Treatment",
    shortDescription:
      "Pain-free root canal treatment to save your natural tooth and relieve discomfort.",
    icon: "healing",
    whatIs:
      "Root canal treatment (endodontic therapy) is a procedure designed to save a tooth that is badly decayed, infected, or damaged. Inside every tooth is a soft tissue called the pulp, which contains nerves, blood vessels, and connective tissue. When the pulp becomes infected or inflamed — due to deep decay, a crack, or trauma — it can cause severe pain and lead to abscess formation if left untreated.\n\nDuring a root canal, Dr. Ekta carefully removes the infected or damaged pulp from inside the tooth, thoroughly cleans and disinfects the root canals, and then fills and seals the space with a biocompatible material. The tooth is then restored with a crown or filling to protect it and restore its full function.\n\nContrary to outdated myths, modern root canal treatment is a routine, comfortable procedure that saves millions of teeth every year. It relieves pain — it doesn't cause it. With advances in technology and anaesthesia, most patients compare the experience to getting a regular filling.",
    whoNeeds:
      "You may need root canal treatment if you experience:\n\n• Severe, persistent toothache that wakes you up at night\n• Prolonged sensitivity to hot or cold that lingers after the stimulus is removed\n• Swelling and tenderness in the gums surrounding a tooth\n• A pimple-like bump (fistula) on the gum near a tooth\n• Darkening or discolouration of a tooth\n• A cracked, chipped, or broken tooth that has exposed the pulp\n• Deep decay that has reached the pulp chamber\n• Repeated dental procedures on the same tooth\n\nRoot canal treatment is recommended when the alternative is tooth extraction. Saving your natural tooth is always the best option, as it maintains your natural bite, prevents neighbouring teeth from shifting, and preserves the jawbone.",
    problems: [
      "Severe, throbbing toothache",
      "Prolonged sensitivity to hot or cold foods",
      "Swelling and tenderness in the gums",
      "Pimple-like bump on the gum (abscess)",
      "Discolouration or darkening of a tooth",
      "Pain when chewing or biting down",
      "Cracked or broken tooth with pulp exposure",
      "Deep decay reaching the nerve of the tooth",
    ],
    benefits: [
      "Saves your natural tooth — no extraction needed",
      "Relieves pain and eliminates infection",
      "Prevents the spread of infection to neighbouring teeth",
      "Preserves your natural bite and jawbone",
      "Restores full chewing function",
      "A treated tooth can last a lifetime with a crown",
      "Cost-effective compared to extraction and replacement",
      "Completed in just 1 to 2 visits in most cases",
    ],
    procedure:
      "Root canal treatment is a straightforward procedure that Dr. Ekta performs with precision and care:\n\n**Step 1 — Diagnosis and X-ray:** Dr. Ekta examines the tooth and takes X-rays to determine the extent of infection and assess the root canals. A treatment plan is discussed with you.\n\n**Step 2 — Anaesthesia:** The area around the affected tooth is completely numbed with local anaesthesia. Sedation options are available for anxious patients.\n\n**Step 3 — Access Opening:** A small opening is made in the crown of the tooth to access the pulp chamber and root canals.\n\n**Step 4 — Pulp Removal and Cleaning:** Using specialised instruments and advanced rotary technology, the infected or damaged pulp is carefully removed from the pulp chamber and root canals. The canals are thoroughly cleaned, shaped, and disinfected to eliminate all bacteria.\n\n**Step 5 — Filling and Sealing:** The cleaned canals are filled with a biocompatible material called gutta-percha and sealed with dental cement to prevent reinfection.\n\n**Step 6 — Crown Placement:** A temporary filling is placed, and the tooth is prepared for a permanent crown. The crown is custom-made and fitted in a subsequent visit, restoring the tooth's strength, shape, and appearance.\n\nMost root canal treatments are completed in 1 to 2 visits, depending on the complexity of the case.",
    painful:
      "Modern root canal treatment is virtually painless. Dr. Ekta uses effective local anaesthesia to completely numb the tooth and surrounding area before beginning the procedure. Most patients report that the experience is no more uncomfortable than getting a simple filling.\n\nIn fact, root canal treatment relieves the severe pain caused by the infected pulp. Many patients feel immediate relief once the infected tissue is removed.\n\nFor patients who experience dental anxiety, sedation options are available to ensure you remain relaxed and comfortable throughout the procedure. Dr. Ekta's gentle technique and modern rotary instruments make the treatment faster and more comfortable than ever before.",
    duration:
      "Root canal treatment typically takes 1 to 2 hours per visit and can often be completed in a single appointment:\n\n• **Front teeth (single canal):** Usually completed in one visit, approximately 45 to 60 minutes\n• **Premolars (1 to 2 canals):** Usually completed in one visit, approximately 60 to 90 minutes\n• **Molars (3 to 4 canals):** May require 2 visits, approximately 90 minutes each\n• **Crown placement:** 1 additional visit, approximately 1 to 2 weeks after the root canal\n\nDr. Ekta uses advanced rotary endodontic technology, which significantly reduces treatment time compared to traditional hand instruments while improving precision and outcomes.",
    recovery:
      "Recovery from root canal treatment is quick and straightforward:\n\n• **Day 1:** The tooth may feel slightly tender for 2 to 3 days. This is normal and indicates the healing process has begun. Over-the-counter pain relief is usually sufficient.\n• **Days 2 to 7:** Any discomfort subsides gradually. You can eat normally on the treated side, though it's wise to avoid very hard foods until the permanent crown is placed.\n• **After crown placement:** The tooth functions fully like a natural tooth with no restrictions.\n\nIt is important to have the permanent crown placed as soon as possible after root canal treatment, as the tooth without a crown is more brittle and prone to fracture.\n\nDr. Ekta schedules a follow-up visit to ensure the tooth is healing properly and to place the permanent crown.",
    risks:
      "Root canal treatment is a very safe and predictable procedure with a success rate of over 90%. However, there are some rare complications to be aware of:\n\n• **Incomplete cleaning:** In complex cases with unusual canal anatomy, some infection may remain. Advanced rotary instruments and microscope-assisted treatment minimise this risk.\n• **Reinfection:** If the filling or crown leaks, bacteria can re-enter the canal. This is why a proper crown is essential after root canal treatment.\n• **Tooth fracture:** A tooth without a crown after root canal treatment is more prone to cracking. Dr. Ekta always recommends crown placement.\n• **Persistent infection:** In rare cases, the infection may not resolve completely and may require retreatment or an apicoectomy (surgical procedure at the root tip).\n\nDr. Ekta's thorough technique, use of advanced imaging, and meticulous attention to detail ensure the highest possible success rate.",
    expectations:
      "After root canal treatment, you can expect the following:\n\n• **Immediate pain relief:** Most patients experience significant relief from the toothache within hours of the procedure.\n• **Natural-looking restoration:** The crown placed after root canal treatment is custom-made to match your natural teeth, making it virtually indistinguishable.\n• **Full function:** You can chew, bite, and eat normally — just as you would with a natural tooth.\n• **Longevity:** With proper care and a crown, a root canal treated tooth can last a lifetime.\n• **No dietary restrictions:** Once the crown is placed, there are no foods you need to avoid.\n• **Improved oral health:** By saving the infected tooth, you prevent the spread of infection and avoid the complications of tooth loss, including bone loss and shifting of adjacent teeth.",
    whyDrEkta:
      "Root canal treatment requires exceptional precision, and Dr. Ekta's expertise in endodontic procedures ensures the best possible outcomes. Her clinic uses advanced rotary endodontic technology for faster, more comfortable, and more thorough root canal treatment.\n\nDr. Ekta works closely with Dr. Bhupesh Gupta, a specialist endodontist with an MDS from PGI Chandigarh and over 10 years of experience, for complex root canal cases. Together, they handle even the most challenging endodontic situations with skill and care.\n\nFrom diagnosis to crown placement, every step is carried out with meticulous attention to detail to ensure your treated tooth lasts a lifetime.",
    faqs: [
      {
        question: "Does a root canal hurt?",
        answer:
          "No. Modern root canal treatment is virtually painless. The area is completely numbed with local anaesthesia, and most patients describe the experience as similar to getting a regular filling. In fact, the procedure relieves the severe pain caused by the infected pulp.",
      },
      {
        question: "How long does a root canal treated tooth last?",
        answer:
          "With proper care and a well-fitted crown, a root canal treated tooth can last a lifetime. The crown may need replacement after 10 to 15 years due to normal wear, but the underlying root canal treatment remains effective indefinitely.",
      },
      {
        question: "Why do I need a crown after root canal?",
        answer:
          "A tooth that has had root canal treatment becomes more brittle over time because it no longer receives nourishment from the pulp. A crown provides structural support, protects the tooth from fracture, and seals it against reinfection. It is an essential part of the treatment.",
      },
      {
        question: "Can a root canal fail?",
        answer:
          "Root canal treatment has a success rate of over 90%. In rare cases, reinfection can occur due to a cracked crown, new decay, or missed canals. If this happens, retreatment or a surgical procedure (apicoectomy) can usually save the tooth.",
      },
      {
        question: "What is the alternative to root canal treatment?",
        answer:
          "The main alternative is tooth extraction. However, losing a tooth leads to bone loss, shifting of adjacent teeth, and the need for a replacement (implant, bridge, or denture). Saving your natural tooth with root canal treatment is almost always the better option.",
      },
      {
        question: "How many visits does root canal treatment take?",
        answer:
          "Most root canal treatments are completed in 1 to 2 visits. Front teeth and less complex cases are often finished in a single visit. Molars with multiple canals may require 2 visits. Dr. Ekta will give you a clear timeline during your consultation.",
      },
    ],
  },
  {
    id: "cosmetic-dentistry",
    title: "Cosmetic Dentistry",
    shortDescription:
      "Transform the appearance of your teeth and gums with advanced cosmetic procedures.",
    icon: "auto_awesome",
    whatIs:
      "Cosmetic dentistry encompasses a range of dental procedures designed to improve the appearance of your teeth, gums, and overall smile. Unlike general dentistry, which focuses on oral health and function, cosmetic dentistry is dedicated to enhancing aesthetics — giving you a smile you can be proud of.\n\nCommon cosmetic procedures include professional teeth whitening, dental veneers, dental bonding, tooth reshaping, gum contouring, and complete smile makeovers. These treatments can address a wide variety of concerns, from minor imperfections to complete smile transformations.\n\nModern cosmetic dentistry uses advanced materials and techniques to create results that look completely natural. Dr. Ekta combines her clinical expertise with an artistic eye to deliver beautiful, lasting results that complement your unique facial features and personality.",
    whoNeeds:
      "Cosmetic dentistry may be right for you if:\n\n• You feel self-conscious about the colour, shape, or alignment of your teeth\n• You hide your smile in photos or social situations\n• You have stained or discoloured teeth that don't respond to over-the-counter whitening\n• You have chipped, cracked, or worn teeth\n• You have gaps between your teeth\n• You have slightly crooked or misaligned teeth that don't require full orthodontic treatment\n• You want to improve the overall symmetry and balance of your smile\n• You have a gummy smile or uneven gum line\n• You want to look younger and more refreshed\n\nCosmetic dentistry is for anyone who wants to enhance their smile and boost their confidence. During your consultation, Dr. Ekta will assess your dental health and discuss which treatments can help you achieve your goals.",
    problems: [
      "Stained or discoloured teeth",
      "Chipped or cracked teeth",
      "Gaps between teeth (diastema)",
      "Slightly crooked or misaligned teeth",
      "Uneven or worn-down teeth",
      "Gummy smile or uneven gum line",
      "Dull or aged-looking smile",
      "Self-consciousness about appearance of teeth",
    ],
    benefits: [
      "Dramatically improved smile appearance",
      "Boosted self-confidence and self-esteem",
      "More youthful and refreshed appearance",
      "Natural-looking results that complement your features",
      "Minimal downtime — many procedures completed in one visit",
      "Long-lasting results with proper care",
      "Improved oral health as a bonus",
      "Customised treatment plans for your unique goals",
    ],
    procedure:
      "Cosmetic dentistry procedures vary based on your specific needs and goals. Here is an overview of the most common treatments:\n\n**Teeth Whitening:** Professional-grade whitening gel is applied to the teeth and activated with a special light. The procedure takes about 1 to 2 hours and can brighten your smile by several shades.\n\n**Dental Veneers:** Ultra-thin porcelain shells are custom-made and bonded to the front surface of your teeth. Veneers can correct the colour, shape, size, and alignment of teeth. The process typically takes 2 to 3 visits.\n\n**Dental Bonding:** Tooth-coloured resin is applied and sculpted to repair chips, cracks, gaps, or discolouration. Bonding is completed in a single visit and is one of the most conservative cosmetic treatments.\n\n**Tooth Reshaping:** Minor adjustments to the shape, length, or surface of teeth using enamel contouring. This is a quick, painless procedure that can make a significant difference.\n\n**Gum Contouring:** For patients with a gummy smile, excess gum tissue can be carefully removed to reveal more of the tooth surface, creating a more balanced and attractive gum line.\n\n**Smile Makeover:** A comprehensive treatment plan combining multiple cosmetic procedures to completely transform your smile. This is fully customised to your unique needs and goals.\n\nDr. Ekta begins every cosmetic treatment with a detailed consultation, including digital smile design, to ensure you understand and are excited about your expected results before any treatment begins.",
    painful:
      "Most cosmetic dental procedures are painless or involve minimal discomfort:\n\n• **Whitening:** Some patients experience temporary tooth sensitivity during or after the procedure, which subsides within a few hours to a day.\n• **Veneers:** Minimal tooth preparation is needed, and local anaesthesia ensures complete comfort. Some patients report mild sensitivity after placement.\n• **Bonding:** No anaesthesia is typically needed. The procedure is completely painless.\n• **Reshaping:** No anaesthesia needed. The removal of tiny amounts of enamel is painless.\n• **Gum contouring:** Performed under local anaesthesia. Some swelling and discomfort for a few days after the procedure.\n\nDr. Ekta prioritises your comfort and uses gentle techniques throughout all cosmetic procedures.",
    duration:
      "Treatment duration depends on the procedures involved:\n\n• **Teeth whitening:** 1 to 2 hours (single visit)\n• **Dental bonding:** 30 to 60 minutes per tooth (single visit)\n• **Tooth reshaping:** 15 to 30 minutes per tooth (single visit)\n• **Veneers:** 2 to 3 visits over 2 to 4 weeks (including lab fabrication)\n• **Gum contouring:** 1 to 2 visits depending on the extent\n• **Smile makeover:** 2 to 8 weeks depending on the combination of treatments\n\nDr. Ekta provides a clear timeline during your consultation so you can plan accordingly.",
    recovery:
      "Recovery depends on the specific procedure:\n\n• **Whitening:** No downtime. You may have temporary sensitivity for 24 to 48 hours.\n• **Bonding and reshaping:** No recovery needed. You can eat and drink normally immediately.\n• **Veneers:** Mild sensitivity for 1 to 2 days. Normal activities can be resumed immediately.\n• **Gum contouring:** Mild swelling and discomfort for 3 to 5 days. Soft foods recommended initially.\n• **Smile makeover:** Varies based on procedures. Dr. Ekta provides detailed aftercare instructions.\n\nIn general, cosmetic procedures have minimal to no downtime, and most patients return to their normal routine immediately.",
    risks:
      "Cosmetic dentistry procedures are generally very safe. However, there are some considerations:\n\n• **Whitening:** Temporary sensitivity and gum irritation are common but resolve quickly. Over-the-counter products used without supervision can damage enamel.\n• **Veneers:** A thin layer of enamel is permanently removed, so the procedure is irreversible. Veneers can chip or crack under excessive force.\n• **Bonding:** The resin material can stain over time and may need periodic replacement or polishing.\n• **Gum contouring:** Over-removal of gum tissue is possible with an inexperienced practitioner. Dr. Ekta uses precise techniques to achieve optimal results.\n\nDr. Ekta discusses all potential risks and benefits during your consultation so you can make an informed decision.",
    expectations:
      "Cosmetic dentistry can have a transformative impact on your appearance and confidence:\n\n• **Immediate improvement:** Many cosmetic treatments produce visible results immediately or within a few days.\n• **Natural appearance:** Modern cosmetic materials are designed to mimic natural teeth perfectly in colour, translucency, and texture.\n• **Long-lasting results:** With proper care, veneers can last 15 to 20 years, bonding 5 to 10 years, and whitening 1 to 3 years (with touch-ups).\n• **Confidence boost:** The most common feedback from cosmetic dentistry patients is a significant improvement in self-confidence and willingness to smile.\n• **Rejuvenated appearance:** A brighter, more youthful smile can take years off your appearance.\n\nDr. Ekta uses digital smile design to show you a preview of your expected results before treatment begins, so you know exactly what to expect.",
    whyDrEkta:
      "Dr. Ekta Narula has a passion for creating beautiful smiles. With advanced training in cosmetic and prosthetic dentistry, she combines clinical expertise with an artistic eye to deliver results that look completely natural.\n\nShe uses the latest materials and techniques, including digital smile design, to plan and execute cosmetic treatments with precision. Her approach is conservative — she preserves as much natural tooth structure as possible while achieving stunning results.\n\nFrom a simple whitening treatment to a complete smile makeover, Dr. Ekta takes the time to understand your goals and creates a personalised treatment plan that exceeds your expectations.",
    faqs: [
      {
        question: "What cosmetic procedure is right for me?",
        answer:
          "During your consultation, Dr. Ekta will evaluate your dental health, discuss your goals, and recommend the best treatment options. Every patient is different, and Dr. Ekta creates personalised plans for each individual.",
      },
      {
        question: "Are cosmetic dental results permanent?",
        answer:
          "Most cosmetic results are long-lasting. Veneers can last 15 to 20 years, bonding 5 to 10 years, and crowns 15 to 20 years. Whitening results can be maintained with periodic touch-ups. Good oral hygiene extends the life of all cosmetic treatments.",
      },
      {
        question: "Can I see what my smile will look like before treatment?",
        answer:
          "Yes! Dr. Ekta uses digital smile design technology to show you a preview of your expected results before any treatment begins. This helps you make an informed decision and get excited about your transformation.",
      },
      {
        question: "Is cosmetic dentistry covered by insurance?",
        answer:
          "Most cosmetic procedures are considered elective and are not covered by dental insurance. However, some treatments that also serve a restorative purpose (like crowns) may be partially covered. Dr. Ekta's team can help you understand your coverage.",
      },
      {
        question: "How do I maintain my cosmetic results?",
        answer:
          "Brush and floss daily, avoid staining foods and beverages (especially after whitening), wear a nightguard if you grind your teeth, and visit Dr. Ekta for regular check-ups and cleanings.",
      },
    ],
  },
  {
    id: "smile-makeovers",
    title: "Smile Makeovers",
    shortDescription:
      "Complete smile transformation customised to your unique features and goals.",
    icon: "sentiment_very_satisfied",
    whatIs:
      "A smile makeover is a comprehensive, personalised treatment plan that combines multiple cosmetic and restorative dental procedures to completely transform your smile. Unlike individual cosmetic treatments that address a single concern, a smile makeover takes a holistic approach — considering your facial features, skin tone, personality, and goals to create a smile that is uniquely yours.\n\nThe process begins with an in-depth consultation where Dr. Ekta evaluates your teeth, gums, bite, and facial aesthetics. Using digital smile design technology, she creates a visual simulation of your new smile, allowing you to see and approve the expected results before any treatment begins.\n\nA smile makeover may include a combination of procedures such as porcelain veneers, teeth whitening, dental bonding, crowns, gum contouring, or orthodontic alignment. The specific treatments are tailored to address your unique concerns and achieve your ideal smile.",
    whoNeeds:
      "A smile makeover may be right for you if:\n\n• You have multiple cosmetic concerns that cannot be addressed with a single treatment\n• You want a dramatic improvement in your smile's appearance\n• You have stained, chipped, worn, crooked, or missing teeth\n• You feel unhappy with your smile and want a complete transformation\n• You are preparing for a special event (wedding, milestone birthday, career change)\n• You want to look younger and more refreshed\n• You have an uneven smile or gum line\n• You want to correct multiple issues in a coordinated treatment plan\n\nA smile makeover is suitable for anyone who wants to enhance their smile's appearance. Dr. Ekta customises every plan to the individual patient's needs, goals, and budget.",
    problems: [
      "Multiple cosmetic dental concerns at once",
      "Severely stained or discoloured teeth",
      "Chipped, cracked, or worn-down teeth",
      "Gaps and spacing between teeth",
      "Crooked or misaligned teeth",
      "Uneven gum line or gummy smile",
      "Missing teeth affecting smile appearance",
      "Desire for a dramatic, life-changing improvement",
    ],
    benefits: [
      "Complete transformation of your smile",
      "Customised plan addressing all your concerns",
      "Natural-looking, harmonious results",
      "Significant boost in self-confidence",
      "Potentially years younger appearance",
      "Improved oral health alongside aesthetics",
      "Digital preview of results before treatment begins",
      "Coordinated treatment for optimal outcomes",
    ],
    procedure:
      "A smile makeover is a carefully planned process that unfolds in stages:\n\n**Step 1 — Comprehensive Consultation:** Dr. Ekta conducts a thorough examination of your teeth, gums, bite, and facial features. Digital photographs, X-rays, and impressions are taken to assess your dental health and plan the transformation.\n\n**Step 2 — Digital Smile Design:** Using advanced software, Dr. Ekta creates a digital simulation of your new smile. This allows you to see exactly how your smile will look after treatment and make adjustments before any work begins.\n\n**Step 3 — Treatment Planning:** Based on your goals, budget, and timeline, Dr. Ekta creates a personalised treatment plan that outlines each procedure, the sequence of treatment, and estimated duration.\n\n**Step 4 — Preparatory Treatments:** Any underlying dental issues (decay, gum disease, old fillings) are addressed first to ensure a healthy foundation for cosmetic work.\n\n**Step 5 — Cosmetic Procedures:** The planned cosmetic treatments are carried out in the optimal sequence. This may include:\n• Teeth whitening (usually done first)\n• Gum contouring (if needed)\n• Veneers or crowns\n• Dental bonding\n• Orthodontic alignment (if needed)\n\n**Step 6 — Final Results:** After all procedures are complete, Dr. Ekta evaluates the final result to ensure it meets your expectations and functions properly.\n\nThe entire process typically takes 2 to 8 weeks, depending on the complexity of the case.",
    painful:
      "A smile makeover is designed to be as comfortable as possible. Most cosmetic procedures involved in a smile makeover are painless or involve minimal discomfort:\n\n• **Whitening:** Temporary sensitivity that resolves within hours\n• **Veneers:** Minimal preparation with local anaesthesia for complete comfort\n• **Bonding:** Painless, no anaesthesia needed\n• **Gum contouring:** Performed under local anaesthesia with mild post-procedure discomfort\n\nFor patients with dental anxiety, sedation options are available to ensure a completely relaxed experience throughout the treatment process.\n\nDr. Ekta's gentle technique and focus on patient comfort mean that even comprehensive smile makeovers are well-tolerated by most patients.",
    duration:
      "The timeline for a smile makeover varies based on the treatments involved:\n\n• **Simple makeovers** (whitening + bonding): 1 to 2 weeks\n• **Moderate makeovers** (veneers + whitening): 3 to 4 weeks\n• **Comprehensive makeovers** (veneers + crowns + gum contouring): 4 to 8 weeks\n• **Makeovers including orthodontics:** 3 to 6 months for alignment, followed by cosmetic finishing\n\nDr. Ekta provides a detailed timeline during your consultation and works to minimise the number of visits while achieving optimal results.",
    recovery:
      "Recovery from a smile makeover depends on the procedures included:\n\n• **Whitening:** No downtime. Temporary sensitivity for 24 to 48 hours.\n• **Veneers:** Mild sensitivity for 1 to 2 days. Normal eating and activities can resume immediately.\n• **Bonding:** No recovery needed.\n• **Gum contouring:** Mild swelling for 3 to 5 days. Soft foods recommended initially.\n• **Crowns:** Mild sensitivity for a few days. Normal function once the permanent crown is placed.\n\nOverall, smile makeovers have minimal downtime. Most patients resume their normal routine immediately after each procedure.",
    risks:
      "As with any comprehensive dental treatment, there are some considerations:\n\n• **Irreversibility:** Some procedures (veneers, enamel reshaping) involve permanent changes to tooth structure. This is why Dr. Ekta uses conservative techniques and thorough planning.\n• **Colour matching:** Multiple restorations must match perfectly. Dr. Ekta works closely with experienced dental technicians to ensure seamless colour integration.\n• **Expectations vs. reality:** Digital smile design helps bridge this gap by showing you the expected results before treatment begins.\n• **Budget considerations:** A comprehensive smile makeover is an investment. Dr. Ekta provides transparent pricing and can phase treatment to fit your budget.\n\nDr. Ekta's meticulous planning and artistic approach minimise these risks and ensure results that exceed expectations.",
    expectations:
      "A smile makeover can be truly life-changing:\n\n• **Visual transformation:** Your smile will look dramatically improved — brighter, straighter, more symmetrical, and more youthful.\n• **Natural results:** Despite the dramatic improvement, results look completely natural and complement your unique facial features.\n• **Confidence boost:** Patients consistently report a significant increase in self-confidence, willingness to smile, and overall quality of life.\n• **Long-lasting:** With proper care, the results of a smile makeover can last 15 to 20 years or more.\n• **Improved function:** Beyond aesthetics, a smile makeover can improve your bite, chewing efficiency, and overall oral health.\n\nDr. Ekta's goal is to create a smile that makes you feel proud and confident every time you look in the mirror.",
    whyDrEkta:
      "A smile makeover requires both clinical excellence and artistic vision — a combination that Dr. Ekta Narula embodies. With advanced training in cosmetic and prosthetic dentistry, she has the skills and experience to plan and execute complex smile transformations.\n\nHer use of digital smile design technology allows patients to preview their results and be active participants in the design process. She works closely with master dental technicians to create restorations that are indistinguishable from natural teeth.\n\nDr. Ekta's conservative approach ensures that as much natural tooth structure as possible is preserved while achieving stunning results. Her attention to detail and commitment to perfection mean that every smile makeover is a masterpiece.",
    faqs: [
      {
        question: "How do I know what treatments I need?",
        answer:
          "Dr. Ekta evaluates your dental health, discusses your goals, and uses digital smile design to show you the possibilities. Together, you decide on the best treatment plan for your needs and budget.",
      },
      {
        question: "Can I see what my new smile will look like?",
        answer:
          "Yes! Dr. Ekta uses digital smile design technology to create a visual simulation of your new smile before treatment begins. You can see, adjust, and approve the expected results.",
      },
      {
        question: "How long does a smile makeover take?",
        answer:
          "Most smile makeovers are completed in 2 to 8 weeks, depending on the treatments involved. Simple makeovers may be done in 1 to 2 visits, while more comprehensive cases may take 4 to 6 visits.",
      },
      {
        question: "Is a smile makeover worth the investment?",
        answer:
          "Patients consistently report that a smile makeover is one of the best investments they have ever made. The boost in confidence, self-esteem, and quality of life is often described as life-changing.",
      },
      {
        question: "Will my smile look natural?",
        answer:
          "Absolutely. Dr. Ekta's goal is to create a smile that looks completely natural and complements your unique facial features. Modern materials and techniques ensure results that are virtually indistinguishable from natural teeth.",
      },
      {
        question: "How long do smile makeover results last?",
        answer:
          "With proper care, the results of a smile makeover can last 15 to 20 years or more. Regular dental check-ups, good oral hygiene, and avoiding habits like teeth grinding will help maintain your results.",
      },
    ],
  },
  {
    id: "teeth-whitening",
    title: "Teeth Whitening",
    shortDescription:
      "Professional-grade whitening for a noticeably brighter, more confident smile.",
    icon: "brightness_7",
    whatIs:
      "Professional teeth whitening is a safe, effective cosmetic procedure that removes stains and discolouration from your teeth, brightening your smile by several shades. Over time, teeth naturally become stained or yellowed due to food, drinks, tobacco, aging, and certain medications.\n\nUnlike over-the-counter whitening products that contain lower concentrations of whitening agents, professional whitening performed by Dr. Ekta uses clinical-grade hydrogen peroxide or carbamide peroxide gel that is carefully applied and controlled for optimal results and safety.\n\nDr. Ekta offers both in-office whitening (for immediate results) and custom take-home whitening kits (for gradual, convenient whitening). Both options are supervised by Dr. Ekta to ensure safety, comfort, and stunning results.",
    whoNeeds:
      "Professional teeth whitening is ideal for you if:\n\n• Your teeth have become yellow, stained, or discoloured over time\n• You have surface stains from coffee, tea, red wine, or cola\n• You smoke or use tobacco products\n• Your teeth have lost their natural brightness due to aging\n• You want to look better for a special occasion (wedding, job interview, reunion)\n• You want a quick, affordable way to enhance your smile\n• You have healthy teeth and gums with no active decay or gum disease\n\nWhitening is most effective on yellow or brown stains. Grey stains caused by certain medications (like tetracycline) may respond less predictably. Dr. Ekta will evaluate your teeth and discuss realistic expectations during your consultation.",
    problems: [
      "Yellow or brown-stained teeth",
      "Dull, aged-looking smile",
      "Stains from coffee, tea, wine, or tobacco",
      "Age-related tooth discolouration",
      "Self-consciousness about tooth colour",
      "Dull appearance before a special event",
      "Uneven tooth colour across the smile",
      "Desire for a brighter, more youthful look",
    ],
    benefits: [
      "Immediate, visible results in a single visit",
      "Safe and supervised by a dental professional",
      "Dramatic improvement — teeth can brighten by 3 to 8 shades",
      "Quick procedure with no downtime",
      "Boosts confidence and enhances your appearance",
      "More effective and safer than over-the-counter products",
      "Custom treatment minimises sensitivity",
      "Affordable way to significantly improve your smile",
    ],
    procedure:
      "Dr. Ekta offers two professional whitening options:\n\n**In-Office Whitening (Zoom or similar):**\n1. Your teeth are thoroughly cleaned to remove surface debris\n2. A protective barrier is applied to your gums to shield them from the whitening gel\n3. Professional-strength hydrogen peroxide gel is applied to the teeth\n4. A special light or laser activates the gel, accelerating the whitening process\n5. The gel is reapplied in 2 to 3 rounds for maximum brightening\n6. A sensitivity-reducing fluoride treatment is applied at the end\n7. Results are immediate — you walk out with a noticeably brighter smile\n\n**Custom Take-Home Kits:**\n1. Dr. Ekta takes impressions of your teeth and creates custom-fitted whitening trays\n2. You receive professional-grade whitening gel and detailed instructions\n3. You wear the trays for a specified time each day (usually 30 minutes to 1 hour)\n4. Results develop gradually over 1 to 2 weeks\n5. The trays can be used for periodic touch-ups to maintain your bright smile\n\nDr. Ekta recommends the best option based on your lifestyle, goals, and sensitivity level.",
    painful:
      "Professional teeth whitening is comfortable for most patients:\n\n• **During the procedure:** Some patients experience a brief sensation of warmth or mild tingling when the whitening gel is applied. This is completely normal.\n• **After the procedure:** Temporary tooth sensitivity to cold air or hot/cold foods is the most common side effect. This typically resolves within 24 to 48 hours.\n• **Sensitivity management:** Dr. Ekta uses desensitising agents and techniques to minimise sensitivity. Custom take-home kits allow you to control the intensity of whitening at your own pace.\n\nOverall, whitening is one of the most comfortable cosmetic dental procedures. The temporary sensitivity is a small trade-off for a dramatically brighter smile.",
    duration:
      "• **In-office whitening:** 1 to 2 hours in a single visit. Results are immediate.\n• **Take-home kits:** 1 to 2 weeks of daily use (30 minutes to 1 hour per day). Results develop gradually.\n• **Combined approach:** Some patients opt for in-office whitening followed by take-home kits for optimal, long-lasting results.\n\nDr. Ekta can also schedule a quick touch-up session before a special event if needed.",
    recovery:
      "There is no recovery time needed for teeth whitening:\n\n• **Immediately after:** You can eat, drink, and resume all normal activities.\n• **First 24 to 48 hours:** Avoid deeply coloured foods and beverages (coffee, red wine, berries, curry) as the teeth are more susceptible to staining immediately after whitening.\n• **Long-term:** Maintain your results with good oral hygiene, regular cleanings, and periodic touch-ups with your custom take-home trays.\n\nThe whitening results are fully developed within 24 to 48 hours after the procedure.",
    risks:
      "Professional teeth whitening is very safe when performed under dental supervision:\n\n• **Tooth sensitivity:** The most common side effect, usually mild and temporary (24 to 48 hours)\n• **Gum irritation:** Rare with professional application, as Dr. Ekta protects your gums during the procedure\n• **Uneven results:** Can occur with existing restorations (crowns, veneers, bonding), which do not whiten. Dr. Ekta discusses this beforehand\n• **Over-whitening:** Not possible with professional supervision. Dr. Ekta controls the concentration and duration for safe results\n\nDr. Ekta's professional supervision ensures that whitening is safe, effective, and tailored to your specific needs.",
    expectations:
      "Here is what you can expect from professional teeth whitening:\n\n• **Immediate brightness:** In-office whitening produces visible results immediately — most patients see a change of 3 to 8 shades in a single visit.\n• **Natural appearance:** Results look natural, not artificially white. Dr. Ekta calibrates the whitening to complement your skin tone and features.\n• **Lasting results:** With proper care, professional whitening results can last 1 to 3 years. Touch-up treatments with your custom trays maintain the brightness.\n• **Not permanent:** Teeth naturally accumulate stains over time. Periodic touch-ups are needed to maintain the whitened appearance.\n• **Confidence boost:** A brighter smile is one of the simplest and most impactful ways to enhance your appearance and confidence.",
    whyDrEkta:
      "Dr. Ekta Narula uses the latest professional whitening technology to deliver safe, effective, and comfortable whitening treatments. She customises the whitening protocol to your specific needs, taking into account your tooth colour, sensitivity level, and desired outcome.\n\nUnlike generic over-the-counter products or un supervised salon whitening, Dr. Ekta's professional approach ensures optimal results while protecting your enamel and gums. She also provides custom take-home kits for convenient maintenance.\n\nWith Dr. Ekta, you get a brighter smile without the risks associated with unprofessional whitening services.",
    faqs: [
      {
        question: "Is professional whitening safe?",
        answer:
          "Yes, professional whitening supervised by Dr. Ekta is very safe. The whitening agents used are clinical-grade and carefully controlled. Dr. Ekta protects your gums and monitors the process to ensure safety and comfort.",
      },
      {
        question: "How long do whitening results last?",
        answer:
          "Results can last 1 to 3 years depending on your diet and habits. Avoiding staining foods and beverages, maintaining good oral hygiene, and using your custom take-home trays for periodic touch-ups will help maintain your bright smile.",
      },
      {
        question: "Will whitening work on my stains?",
        answer:
          "Professional whitening is most effective on yellow and brown stains from food, drinks, tobacco, and aging. Grey stains (sometimes caused by medications like tetracycline) may respond less predictably. Dr. Ekta will evaluate your stains and provide realistic expectations during your consultation.",
      },
      {
        question: "Can I whiten my teeth if I have crowns or veneers?",
        answer:
          "Crowns, veneers, and bonding do not respond to whitening agents. If you have restorations on your front teeth, Dr. Ekta will discuss options to ensure a uniform colour across your smile.",
      },
      {
        question: "How often can I whiten my teeth?",
        answer:
          "Dr. Ekta recommends professional whitening once or twice a year, with periodic touch-ups using your custom take-home trays in between. Over-whitening is not recommended and is not possible under professional supervision.",
      },
    ],
  },
  {
    id: "clear-aligners",
    title: "Clear Aligners",
    shortDescription:
      "Straighten your teeth discreetly with virtually invisible, removable aligners.",
    icon: "visibility",
    whatIs:
      "Clear aligners are a modern, discreet orthodontic treatment that gradually straightens your teeth using a series of custom-made, virtually invisible plastic trays. Unlike traditional metal braces, clear aligners are removable, comfortable, and nearly invisible — making them the preferred choice for adults and teens who want to straighten their teeth without the look of metal wires and brackets.\n\nEach set of aligners is precisely engineered using advanced 3D computer technology to apply controlled forces that move your teeth incrementally into their ideal positions. You wear each set of aligners for 1 to 2 weeks before progressing to the next set in the series, gradually guiding your teeth toward their final, aligned position.\n\nClear aligners can treat a wide range of orthodontic issues, including crowding, spacing, overbite, underbite, and crossbite. Dr. Ekta uses leading aligner technology to deliver predictable, beautiful results.",
    whoNeeds:
      "Clear aligners may be right for you if:\n\n• You have crooked, crowded, or overlapping teeth\n• You have gaps or spaces between your teeth\n• You have a mild to moderate overbite, underbite, or crossbite\n• You want a discreet alternative to metal braces\n• You are an adult or teen who feels self-conscious about wearing braces\n• You have a busy lifestyle and want a treatment that doesn't interfere with your daily routine\n• You play sports or musical instruments (aligners are removable for activities)\n• You want to maintain your oral hygiene easily during orthodontic treatment\n\nClear aligners are suitable for mild to moderate orthodontic cases. Severe skeletal discrepancies may require traditional braces or combined treatment. Dr. Ekta will assess your case and recommend the best approach.",
    problems: [
      "Crooked or misaligned teeth",
      "Gaps between teeth (spacing)",
      "Crowded or overlapping teeth",
      "Mild to moderate overbite",
      "Mild to moderate underbite",
      "Crossbite (upper and lower teeth don't align properly)",
      "Relapse after previous orthodontic treatment",
      "Self-consciousness about wearing metal braces",
    ],
    benefits: [
      "Virtually invisible — most people won't notice you're wearing them",
      "Removable — eat, brush, and floss normally",
      "Comfortable — smooth plastic, no metal wires or brackets",
      "No food restrictions during treatment",
      "Easy oral hygiene — no special cleaning routines needed",
      "Fewer dental visits than traditional braces",
      "Digital preview of your final smile before treatment begins",
      "Ideal for adults and teens with busy lifestyles",
    ],
    procedure:
      "The clear aligner treatment process is straightforward and well-organised:\n\n**Step 1 — Consultation and Assessment:** Dr. Ekta examines your teeth, takes digital scans, X-rays, and photographs to assess your orthodontic needs and determine if clear aligners are suitable for you.\n\n**Step 2 — Digital Treatment Planning:** Using advanced software, Dr. Ekta creates a 3D digital model of your teeth and plans the precise movements needed to achieve your ideal alignment. You can see a virtual simulation of your treatment outcome before you begin.\n\n**Step 3 — Custom Aligner Fabrication:** Your custom aligners are manufactured based on the digital treatment plan. You receive several sets of aligners at each visit.\n\n**Step 4 — Wearing Your Aligners:** You wear each set of aligners for 1 to 2 weeks, 20 to 22 hours per day. You remove them only for eating, drinking (anything other than water), brushing, and flossing.\n\n**Step 5 — Progress Check-ups:** You visit Dr. Ekta every 4 to 6 weeks to monitor progress and receive your next sets of aligners.\n\n**Step 6 — Retention:** After active treatment is complete, you wear a retainer to maintain your results. Dr. Ekta provides guidance on the retainer schedule.\n\nThe entire process is designed to fit seamlessly into your lifestyle.",
    painful:
      "Clear aligners are one of the most comfortable orthodontic options available:\n\n• **Initial fitting:** No pain. The aligners fit snugly over your teeth.\n• **When switching to new aligners:** You may feel mild pressure or tightness for the first 2 to 3 days with each new set. This means the aligners are working — moving your teeth into position. The discomfort is mild and temporary.\n• **No metal irritation:** Unlike braces, there are no wires or brackets to irritate your cheeks, lips, or tongue.\n• **Overall comfort:** Most patients report that clear aligners are significantly more comfortable than traditional braces.\n\nIf you experience discomfort, over-the-counter pain relief is usually sufficient. Dr. Ekta adjusts the treatment plan if any particular set of aligners causes excessive discomfort.",
    duration:
      "Treatment duration depends on the complexity of your case:\n\n• **Mild cases** (minor crowding or spacing): 3 to 6 months\n• **Moderate cases** (moderate crowding, spacing, or bite issues): 6 to 12 months\n• **Complex cases** (significant alignment and bite correction): 12 to 18 months\n\nOn average, most clear aligner cases are completed in 6 to 12 months. Dr. Ekta provides a personalised timeline during your consultation based on your specific needs.\n\nYou'll visit Dr. Ekta every 4 to 6 weeks for progress monitoring, and you'll change to a new set of aligners every 1 to 2 weeks at home.",
    recovery:
      "There is no recovery time needed for clear aligner treatment:\n\n• **Day-to-day life:** You can eat, drink, work, exercise, and socialise normally.\n• **Oral hygiene:** Brush and floss as usual — simply remove the aligners first.\n• **Sports and activities:** Remove aligners for contact sports and reinsert them after.\n• **Speech:** Some patients experience a slight lisp for the first few days, which resolves quickly as you adapt.\n• **After treatment:** Wear your retainer as directed to maintain your results.\n\nClear aligners are designed to fit your lifestyle, not the other way around.",
    risks:
      "Clear aligners are a safe orthodontic treatment with some important considerations:\n\n• **Compliance-dependent:** Aligners must be worn 20 to 22 hours per day for effective results. Not wearing them enough can prolong treatment or compromise outcomes.\n• **Not suitable for all cases:** Severe orthodontic issues may require traditional braces or combined treatment.\n• **Attachment placement:** Some cases require small tooth-coloured attachments bonded to teeth to help the aligners grip and move teeth effectively.\n• **Retention needed:** Like all orthodontic treatment, retainers are essential to maintain results after treatment.\n• **White spots:** Poor oral hygiene during treatment can lead to white spot lesions on teeth. Proper brushing and flossing prevent this.\n\nDr. Ekta carefully evaluates your case to ensure clear aligners are the right treatment choice for you.",
    expectations:
      "Here is what you can expect from clear aligner treatment:\n\n• **Discreet treatment:** Most people won't notice you're wearing aligners. They are virtually invisible in conversation and photos.\n• **Gradual improvement:** You'll notice changes in your smile within the first few weeks of treatment.\n• **Final result:** A beautifully aligned, straight smile that improves both your appearance and dental health.\n• **Improved oral health:** Straight teeth are easier to clean, reducing the risk of decay and gum disease.\n• **Confidence boost:** Many patients feel more confident smiling and socialising during and after treatment.\n• **Long-lasting results:** With proper retainer use, your straight smile can last a lifetime.",
    whyDrEkta:
      "Dr. Ekta Narula combines orthodontic expertise with advanced technology to deliver outstanding clear aligner results. She carefully plans each case using digital treatment planning software, ensuring precise, predictable tooth movement.\n\nShe works closely with Dr. U Arora, an orthodontist with an MDS (Gold Medalist) and 13+ years of experience in braces and aligners, for complex orthodontic cases. Together, they ensure that every patient achieves optimal alignment and a beautiful, healthy smile.\n\nFrom initial assessment to final retention, Dr. Ekta provides personalised care and regular monitoring to keep your treatment on track.",
    faqs: [
      {
        question: "Are clear aligners as effective as braces?",
        answer:
          "For mild to moderate orthodontic cases, clear aligners are equally effective as traditional braces. Severe cases may require braces. Dr. Ekta evaluates your specific needs and recommends the most effective treatment option.",
      },
      {
        question: "How many hours per day should I wear my aligners?",
        answer:
          "Aligners should be worn 20 to 22 hours per day, removing them only for eating, drinking (anything other than water), brushing, and flossing. Consistent wear is essential for achieving results on time.",
      },
      {
        question: "How long is clear aligner treatment?",
        answer:
          "Most cases take 6 to 12 months, depending on the complexity. Mild cases may be completed in as little as 3 months, while more complex cases may take up to 18 months. Dr. Ekta provides a personalised timeline during your consultation.",
      },
      {
        question: "Can I eat and drink with aligners in?",
        answer:
          "You should remove your aligners before eating or drinking anything other than water. This keeps the aligners clean and prevents staining or damage. You can eat and drink whatever you like — there are no food restrictions!",
      },
      {
        question: "What happens after clear aligner treatment?",
        answer:
          "After active treatment, you'll wear a retainer to maintain your results. Dr. Ekta recommends wearing your retainer full-time for the first few months, then transitioning to nighttime wear. Retainers are essential for keeping your smile straight long-term.",
      },
      {
        question: "How often do I visit the dentist during treatment?",
        answer:
          "You'll visit Dr. Ekta every 4 to 6 weeks to check your progress and receive your next sets of aligners. These visits are quick and convenient, usually taking 15 to 20 minutes.",
      },
    ],
  },
  {
    id: "crowns-bridges",
    title: "Crowns & Bridges",
    shortDescription:
      "Restore damaged or missing teeth with strong, natural-looking crowns and bridges.",
    icon: "domain",
    whatIs:
      "Dental crowns and bridges are two of the most reliable and time-tested restorative dental treatments. A dental crown (also called a cap) is a custom-made restoration that completely covers a damaged, weakened, or aesthetically compromised tooth, restoring its shape, size, strength, and appearance. Crowns are made from high-quality materials such as porcelain, zirconia, or porcelain-fused-to-metal, and are designed to blend seamlessly with your natural teeth.\n\nA dental bridge is used to replace one or more missing teeth. It consists of one or more artificial teeth (pontics) supported by crowns placed on the adjacent healthy teeth (abutments). The bridge fills the gap, restoring your ability to chew, speak, and smile confidently.\n\nBoth crowns and bridges are permanently fixed in your mouth and function just like natural teeth. With proper care, they can last 15 to 20 years or more.",
    whoNeeds:
      "You may need a crown if:\n\n• You have a large cavity that cannot be restored with a filling\n• Your tooth is cracked, broken, or significantly worn down\n• You have had root canal treatment and need to protect the treated tooth\n• You have a dental implant that needs a visible restoration\n• You want to improve the appearance of a misshaped or severely discoloured tooth\n• Your tooth is weakened and at risk of fracture\n\nYou may need a bridge if:\n\n• You are missing one or more consecutive teeth\n• You want a fixed (non-removable) replacement for missing teeth\n• You are not a candidate for dental implants\n• You want to prevent adjacent teeth from shifting into the gap\n• You want to restore your bite and chewing ability",
    problems: [
      "Large cavities that cannot support a filling",
      "Cracked, broken, or fractured teeth",
      "Teeth weakened after root canal treatment",
      "Severely worn-down teeth",
      "Missing one or more teeth in a row",
      "Gaps in your smile affecting appearance",
      "Adjacent teeth drifting into empty spaces",
      "Difficulty chewing due to damaged or missing teeth",
    ],
    benefits: [
      "Restores full strength and function of damaged teeth",
      "Permanently replaces missing teeth (bridges)",
      "Natural appearance — matches your existing teeth",
      "Protects weakened teeth from further damage",
      "Prevents neighbouring teeth from shifting",
      "Restores your ability to chew and speak properly",
      "Long-lasting — 15 to 20 years or more with proper care",
      "Fixed and permanent — no adhesives or removal needed",
    ],
    procedure:
      "Getting a crown or bridge typically involves 2 to 3 visits over 2 to 3 weeks:\n\n**Visit 1 — Tooth Preparation:**\n1. Dr. Ekta numbs the tooth and surrounding area with local anaesthesia\n2. The tooth is carefully shaped to accommodate the crown (approximately 1 to 2 mm of enamel is removed)\n3. For bridges, the adjacent teeth on either side of the gap are also prepared\n4. Precise digital impressions or traditional impressions are taken\n5. A temporary crown or bridge is placed to protect the prepared teeth\n6. Impressions are sent to a dental laboratory where your permanent restoration is custom-crafted\n\n**Visit 2 — Temporary Check (if needed):**\n• A brief visit to check the fit and comfort of the temporary restoration\n\n**Visit 3 — Permanent Placement:**\n1. The temporary restoration is removed\n2. The permanent crown or bridge is tried in and evaluated for fit, colour, and bite\n3. Dr. Ekta makes any necessary adjustments\n4. The crown or bridge is permanently cemented in place\n5. Your bite is checked and adjusted for comfort\n\nThe entire process ensures a precise, comfortable fit and natural-looking result.",
    painful:
      "Crown and bridge treatment is comfortable throughout:\n\n• **During preparation:** The tooth is completely numbed with local anaesthesia. You should feel no pain during the preparation process.\n• **With the temporary crown:** You may experience mild sensitivity to hot and cold, and the temporary may feel slightly different from your natural tooth. This is normal.\n• **After placement:** The permanent crown or bridge may feel slightly different initially as your mouth adjusts. Most patients adapt within a few days.\n• **Overall:** Crown and bridge treatment is one of the least uncomfortable restorative procedures in dentistry.",
    duration:
      "Crown and bridge treatment typically involves 2 to 3 visits over 2 to 3 weeks:\n\n• **Visit 1:** Tooth preparation and impressions (60 to 90 minutes)\n• **Laboratory fabrication:** 1 to 2 weeks\n• **Visit 2 (if needed):** Temporary check (15 to 20 minutes)\n• **Visit 3:** Permanent crown or bridge placement (30 to 45 minutes)\n\nSome practices offer same-day crowns using CAD/CAM technology, but traditional lab-fabricated restorations often provide superior aesthetics and fit.",
    recovery:
      "Recovery from crown and bridge treatment is minimal:\n\n• **Immediately after:** The numbing wears off within a few hours. You can eat normally on the treated side.\n• **First few days:** You may experience mild sensitivity to hot and cold, and the crown or bridge may feel slightly different. This is normal and resolves within a few days.\n• **Week 1 to 2:** Your mouth fully adjusts to the new restoration. Sensitivity subsides.\n• **Long-term:** Care for your crown or bridge like natural teeth — brush, floss, and visit Dr. Ekta for regular check-ups.\n\nWith proper care, crowns and bridges can last 15 to 20 years or more.",
    risks:
      "Crown and bridge treatment is very safe and predictable. However, there are some considerations:\n\n• **Tooth sensitivity:** Some sensitivity to hot and cold is normal after treatment and usually resolves within a few weeks.\n• **Nerve damage:** In rare cases, tooth preparation can irritate the nerve. If this occurs, root canal treatment may be needed.\n• **Crown loosening:** The crown can become loose over time due to cement failure. This is easily re-cemented by Dr. Ekta.\n• **Bridge failure:** If the supporting teeth decay or develop gum disease, the bridge may fail. Good oral hygiene is essential.\n• **Tooth decay:** Decay can develop under crowns or bridges. Regular check-ups and good oral hygiene prevent this.\n\nDr. Ekta uses high-quality materials and precise technique to minimise these risks and maximise the lifespan of your restoration.",
    expectations:
      "Here is what you can expect from your crown or bridge:\n\n• **Natural appearance:** Your crown or bridge is custom-made to match the colour, shape, and size of your surrounding teeth. It will look and feel completely natural.\n• **Full function:** You can eat, chew, bite, and speak normally — just as you would with natural teeth.\n• **Comfort:** After a brief adjustment period, you will forget the crown or bridge is even there.\n• **Durability:** With proper care, your crown or bridge can last 15 to 20 years or more.\n• **Confidence:** A restored smile means you can smile, eat, and socialise without worry or self-consciousness.\n• **Protection:** Crowns strengthen and protect weakened teeth from further damage, potentially saving you from more extensive treatment in the future.",
    whyDrEkta:
      "Dr. Ekta Narula has extensive experience in restorative dentistry, with particular expertise in prosthetic dentistry. She understands that crowns and bridges must not only look beautiful but also function perfectly.\n\nShe uses high-quality dental materials and works with experienced dental laboratories to create restorations that are precisely fitted, beautifully crafted, and built to last. Her meticulous attention to detail during tooth preparation, impressions, and cementation ensures optimal results.\n\nFrom a single crown to a full-arch bridge, Dr. Ekta provides restorations that restore both function and confidence.",
    faqs: [
      {
        question: "How long do crowns and bridges last?",
        answer:
          "With proper care, crowns and bridges can last 15 to 20 years or more. Good oral hygiene, regular dental check-ups, and avoiding habits like teeth grinding will help extend the lifespan of your restoration.",
      },
      {
        question: "Do crowns and bridges look natural?",
        answer:
          "Yes! Modern dental materials are designed to mimic natural teeth in colour, translucency, and texture. Dr. Ekta carefully matches the colour and shape of your existing teeth for a seamless, natural appearance.",
      },
      {
        question: "How do I care for a bridge?",
        answer:
          "Brush and floss daily, paying special attention to the areas around and under the bridge. Use a water flosser or bridge threader to clean under the pontic (artificial tooth). Regular dental check-ups are essential to monitor the health of supporting teeth.",
      },
      {
        question: "Can I eat normally with a crown or bridge?",
        answer:
          "Yes! Once the permanent crown or bridge is placed, you can eat normally — including hard and crunchy foods. The restoration is designed to function just like a natural tooth.",
      },
      {
        question: "What is the difference between a crown and a veneer?",
        answer:
          "A crown covers the entire tooth and is used for damaged or weakened teeth that need structural support. A veneer covers only the front surface and is primarily used for cosmetic improvement of otherwise healthy teeth.",
      },
    ],
  },
  {
    id: "gum-care",
    title: "Gum Care",
    shortDescription:
      "Expert diagnosis and treatment of gum disease for lasting oral health.",
    icon: "favorite",
    whatIs:
      "Gum care encompasses the prevention, diagnosis, and treatment of gum (periodontal) disease — one of the most common chronic infections affecting adults worldwide. Your gums are the foundation that supports your teeth, and keeping them healthy is essential for maintaining your teeth and overall health.\n\nGum disease progresses in two main stages:\n\n• **Gingivitis:** The early, reversible stage characterised by red, swollen, bleeding gums. Gingivitis is caused by the buildup of plaque (bacteria) along the gum line. With professional cleaning and good oral hygiene, gingivitis can be completely reversed.\n\n• **Periodontitis:** The advanced stage where infection spreads below the gum line, destroying the bone and tissues that hold your teeth in place. If left untreated, periodontitis can lead to tooth loss. While it cannot be fully cured, it can be managed and controlled with professional treatment.\n\nResearch has also linked gum disease to serious systemic conditions including heart disease, diabetes, stroke, and pregnancy complications — making gum health not just a dental concern, but a whole-body health issue.",
    whoNeeds:
      "You should seek gum care if you experience:\n\n• Bleeding when you brush or floss\n• Red, swollen, or tender gums\n• Gums that are pulling away from your teeth (receding gums)\n• Persistent bad breath or bad taste in your mouth\n• Loose or shifting teeth\n• Pus between your teeth and gums\n• Changes in your bite\n• Spaces developing between your teeth\n\nRisk factors for gum disease include:\n• Smoking or tobacco use\n• Poor oral hygiene\n• Diabetes\n• Hormonal changes (pregnancy, menopause)\n• Certain medications that cause dry mouth\n• Genetic predisposition\n• Stress (weakens the immune system)\n\nEven if you don't have symptoms, regular gum assessments by Dr. Ekta are important, as gum disease can progress silently.",
    problems: [
      "Bleeding gums during brushing or flossing",
      "Red, swollen, or inflamed gums",
      "Receding gums exposing tooth roots",
      "Persistent bad breath (halitosis)",
      "Loose or shifting teeth",
      "Pus or discharge between teeth and gums",
      "Pain while chewing",
      "Changes in the fit of your bite",
    ],
    benefits: [
      "Prevents tooth loss from gum disease",
      "Stops the progression of periodontal disease",
      "Reduces the risk of systemic health complications",
      "Freshens breath and improves oral comfort",
      "Preserves jawbone density",
      "Restores gum health and a healthy pink colour",
      "Improves the appearance of your smile",
      "Protects the investment you've made in your dental health",
    ],
    procedure:
      "Dr. Ekta provides a comprehensive range of gum treatments based on the severity of your condition:\n\n**For Gingivitis (Early Stage):**\n1. Professional cleaning (prophylaxis) to remove plaque and tartar\n2. Oral hygiene instruction to improve your home care routine\n3. Follow-up cleaning in 3 to 6 months\n\n**For Mild to Moderate Periodontitis:**\n1. **Scaling and Root Planing (Deep Cleaning):** The most common treatment for periodontitis. This procedure removes plaque and tartar from below the gum line and smooths the root surfaces to help gums reattach to the teeth. It is typically performed under local anaesthesia and may be done in 1 to 4 visits.\n2. **Antibiotic therapy:** Localised antibiotics may be placed in periodontal pockets to eliminate bacteria.\n\n**For Advanced Periodontitis:**\n1. **Periodontal surgery:** In cases where deep pockets remain after non-surgical treatment, surgical procedures may be needed to access and clean the root surfaces thoroughly.\n2. **Bone grafting:** If bone loss has occurred, bone grafting procedures can help regenerate lost bone.\n3. **Gum grafting:** For receding gums, tissue grafts can cover exposed roots and restore gum tissue.\n\nDr. Ekta creates a personalised treatment plan based on your specific condition and needs.",
    painful:
      "Gum treatments are designed to be as comfortable as possible:\n\n• **Professional cleaning:** Painless. You may feel some vibration and pressure, but no pain.\n• **Scaling and root planing:** Performed under local anaesthesia, so the treated area is completely numb. Most patients feel no pain during the procedure.\n• **After treatment:** Mild tenderness and sensitivity for a few days is normal. Over-the-counter pain relief is usually sufficient.\n• **Surgical procedures:** Performed under local anaesthesia with sedation options if needed. Post-operative discomfort is managed with prescribed medication.\n\nDr. Ekta's gentle technique and modern instruments make gum treatment comfortable and efficient.",
    duration:
      "Treatment duration depends on the severity of your gum disease:\n\n• **Gingivitis:** 1 to 2 professional cleanings over 1 to 3 months\n• **Mild periodontitis:** Scaling and root planing over 1 to 2 visits\n• **Moderate periodontitis:** Scaling and root planing over 2 to 4 visits, followed by re-evaluation\n• **Advanced periodontitis:** Non-surgical treatment followed by surgical procedures if needed, over several months\n• **Maintenance:** Regular periodontal maintenance visits every 3 to 4 months after treatment\n\nGum disease is a chronic condition that requires ongoing management. Regular maintenance visits are essential to keep the disease under control.",
    recovery:
      "Recovery from gum treatment varies by procedure:\n\n• **After professional cleaning:** No downtime. Normal brushing and flossing can resume immediately.\n• **After scaling and root planing:** Mild tenderness and sensitivity for 3 to 7 days. Avoid very hot or cold foods. Use a soft toothbrush.\n• **After gum surgery:** Mild swelling and discomfort for 1 to 2 weeks. Follow Dr. Ekta's aftercare instructions carefully, including any prescribed medications.\n• **Long-term:** Good oral hygiene and regular maintenance visits are essential to prevent recurrence.\n\nWith proper care and maintenance, gum disease can be effectively controlled, and your oral health can be preserved.",
    risks:
      "Gum treatment is safe and effective. Some considerations include:\n\n• **Treatment alone is not enough:** Gum disease is a chronic condition. Without ongoing maintenance and good oral hygiene, it can recur.\n• **Tooth sensitivity:** Increased sensitivity after deep cleaning is common but usually temporary.\n• **Gum recession:** Some recession may occur after treatment, especially in areas where significant inflammation was present.\n• **Tooth loss:** In very advanced cases, despite treatment, some teeth may be lost. Early treatment is always better.\n• **Systemic health risks:** Untreated gum disease is linked to heart disease, diabetes complications, and other systemic conditions.\n\nDr. Ekta emphasises that prevention and early intervention are the keys to avoiding these complications.",
    expectations:
      "Here is what you can expect from gum care at Dr. Ekta's clinic:\n\n• **Thorough assessment:** Dr. Ekta measures your periodontal pockets, assesses bone levels, and creates a comprehensive treatment plan.\n• **Effective treatment:** Professional deep cleaning and targeted therapy can successfully halt the progression of gum disease.\n• **Healthier gums:** After treatment, your gums will be less swollen, bleed less, and have a healthy pink colour.\n• **Fresher breath:** Removing bacteria and tartar from below the gum line eliminates the source of persistent bad breath.\n• **Long-term stability:** With regular maintenance visits and good home care, your gum health can be maintained for life.\n• **Whole-body health:** Healthy gums contribute to better overall health, reducing the risk of systemic complications.",
    whyDrEkta:
      "Dr. Ekta Narula provides comprehensive gum care, from preventive cleanings to advanced periodontal treatments. She emphasises the importance of gum health as the foundation of a healthy smile and overall well-being.\n\nHer clinic uses modern diagnostic tools to detect gum disease early and advanced treatment techniques to manage it effectively. She works closely with Dr. Anil Yadav, a periodontist with 15+ years of experience, for complex periodontal cases.\n\nFrom initial assessment to long-term maintenance, Dr. Ekta provides personalised gum care that preserves your teeth and protects your health.",
    faqs: [
      {
        question: "What is gum disease?",
        answer:
          "Gum disease is an infection of the tissues that surround and support your teeth. It ranges from mild gingivitis (red, swollen, bleeding gums) to severe periodontitis (bone loss and tooth loosening). It is caused primarily by bacteria in plaque buildup.",
      },
      {
        question: "Is gum disease serious?",
        answer:
          "Yes. Untreated gum disease can lead to tooth loss and has been linked to heart disease, diabetes complications, stroke, and pregnancy complications. Early detection and treatment are essential.",
      },
      {
        question: "How is gum disease treated?",
        answer:
          "Treatment depends on the severity. Gingivitis is treated with professional cleaning and improved oral hygiene. Periodontitis requires scaling and root planing (deep cleaning), and may require surgery in advanced cases. Ongoing maintenance is essential.",
      },
      {
        question: "Can gum disease be cured?",
        answer:
          "Gingivitis can be completely reversed with proper treatment and oral hygiene. Periodontitis cannot be fully cured but can be effectively controlled and managed with professional treatment and ongoing maintenance.",
      },
      {
        question: "How often should I have gum check-ups?",
        answer:
          "Dr. Ekta recommends gum assessments at every regular check-up (every 6 months for healthy gums). If you have a history of gum disease, more frequent visits (every 3 to 4 months) may be recommended.",
      },
    ],
  },
  {
    id: "childrens-dentistry",
    title: "Children's Dentistry",
    shortDescription:
      "Gentle, fun, and child-friendly dental care for your little ones.",
    icon: "child_care",
    whatIs:
      "Children's dentistry (pediatric dentistry) is a specialised branch of dental care focused on the oral health of infants, children, and adolescents. It encompasses preventive care, early orthodontic assessment, treatment of dental problems in children, and education to establish lifelong oral health habits.\n\nDr. Ekta and her team provide a warm, friendly, and non-threatening environment where children feel safe and comfortable. The clinic uses child-friendly language, gentle techniques, and positive reinforcement to make every dental visit a positive experience.\n\nEarly dental care is crucial because children's primary (baby) teeth play important roles in chewing, speaking, and guiding permanent teeth into their correct positions. Healthy baby teeth set the foundation for a lifetime of good oral health.",
    whoNeeds:
      "Every child should visit the dentist by their first birthday or within 6 months of their first tooth erupting. Children's dentistry is important for:\n\n• **Infants (0 to 2 years):** Early dental assessments, guidance on teething, thumb-sucking, and oral hygiene\n• **Toddlers (2 to 5 years):** First dental visits, preventive care, fluoride treatments, and parental education\n• **School-age children (6 to 12 years):** Regular check-ups, sealants, cavity treatment, and early orthodontic evaluation\n• **Teenagers (13 to 18 years):** Orthodontic assessment, wisdom tooth monitoring, and ongoing preventive care\n\nRegular dental visits from a young age help children become comfortable with dental care, prevent problems before they start, and catch issues early when they are easiest to treat.",
    problems: [
      "Cavities in baby teeth",
      "Teething pain and discomfort",
      "Thumb sucking or pacifier habits",
      "Early orthodontic concerns",
      "Dental anxiety or fear in children",
      "Toothache or dental emergency",
      "Teaching proper brushing and flossing",
      "Dietary advice for healthy teeth",
    ],
    benefits: [
      "Establishes positive dental habits from an early age",
      "Prevents cavities and gum problems in children",
      "Early detection of orthodontic issues",
      "Creates a comfortable, positive association with dental care",
      "Protects baby teeth until they naturally fall out",
      "Educates parents on children's oral health",
      "Child-friendly environment reduces dental anxiety",
      "Comprehensive care from infancy through adolescence",
    ],
    procedure:
      "A child's dental visit at Dr. Ekta's clinic is designed to be fun, comfortable, and educational:\n\n**First Visit (Happy Visit):**\n• A gentle, comprehensive examination of your child's teeth, gums, and bite\n• Digital X-rays (if needed) using minimal radiation\n• Professional cleaning to remove plaque and tartar\n• Fluoride treatment to strengthen teeth\n• Oral hygiene instruction tailored to your child's age\n• Discussion of dietary habits and their impact on dental health\n• Parents receive guidance on home care routines\n\n**Preventive Treatments:**\n• **Dental sealants:** A thin protective coating applied to the chewing surfaces of back teeth to prevent cavities. Quick, painless, and highly effective.\n• **Fluoride treatments:** Professional application of fluoride to strengthen tooth enamel and prevent decay.\n• **Space maintainers:** If a baby tooth is lost early, a space maintainer holds the space for the permanent tooth.\n\n**Treatment of Dental Problems:**\n• Fillings for cavities (tooth-coloured, BPA-free materials)\n• Pulp treatment for infected baby teeth\n• Extractions when necessary\n• Emergency treatment for dental trauma\n\nDr. Ekta uses a gentle, child-friendly approach and explains every step to your child in a way they can understand.",
    painful:
      "Dr. Ekta and her team go to great lengths to ensure children are comfortable and pain-free:\n\n• **Gentle techniques:** The team uses child-friendly language and a gentle touch to make procedures as comfortable as possible.\n• **Local anaesthesia:** When treatment is needed, the area is completely numbed so your child feels no pain.\n• **Sedation options:** For anxious children or longer procedures, sedation options are available to help your child relax.\n• **Distraction techniques:** TV shows, music, and toys help keep your child distracted and at ease during treatment.\n• **Positive reinforcement:** The team praises and encourages children throughout every visit.\n\nMost children leave Dr. Ekta's clinic with a smile, often asking when they can come back!",
    duration:
      "• **Routine check-up and cleaning:** 30 to 60 minutes\n• **Dental sealants:** 15 to 30 minutes per tooth (completed in a single visit)\n• **Fluoride treatment:** 5 to 10 minutes (completed during a regular check-up)\n• **Fillings:** 30 to 60 minutes depending on the size and location\n• **Emergency treatment:** Varies based on the situation\n\nDr. Ekta keeps appointments efficient while ensuring your child is comfortable throughout.",
    recovery:
      "Children typically recover very quickly from dental procedures:\n\n• **After routine cleaning:** No recovery needed. Normal eating and activities can resume immediately.\n• **After fillings:** Your child can eat normally once the numbing wears off (usually 1 to 2 hours).\n• **After extractions:** Soft foods for 1 to 2 days. Follow the aftercare instructions provided by Dr. Ekta.\n• **After sealants:** No recovery needed. Sealants are immediately functional.\n\nDr. Ekta provides clear aftercare instructions to parents and is available for any questions or concerns after treatment.",
    risks:
      "Pediatric dental treatment at Dr. Ekta's clinic is very safe:\n\n• **Prevention is key:** Regular dental visits catch problems early, when treatment is simpler and less invasive.\n• **Baby teeth importance:** Untreated cavities in baby teeth can affect permanent teeth, cause pain, and lead to infections.\n• **Anxiety management:** Dr. Ekta's child-friendly approach minimises dental anxiety, which can otherwise persist into adulthood.\n• **Radiation safety:** Digital X-rays use minimal radiation and are only taken when clinically necessary.\n\nDr. Ekta emphasises that the biggest risk is avoiding dental care altogether. Early, regular visits are the best way to protect your child's oral health.",
    expectations:
      "Here is what you can expect from children's dentistry at Dr. Ekta's clinic:\n\n• **Welcoming environment:** The clinic is designed to be friendly and comfortable for children of all ages.\n• **Gentle care:** Dr. Ekta and her team are experienced in working with children and use gentle, reassuring techniques.\n• **Education:** Your child will learn proper brushing, flossing, and healthy eating habits in a fun, age-appropriate way.\n• **Early intervention:** Any problems are caught and treated early, before they become more serious or expensive.\n• **Positive experience:** Children who have positive dental experiences from a young age are more likely to maintain good oral health throughout their lives.\n• **Lifelong habits:** Regular dental visits establish a foundation of oral health awareness that lasts a lifetime.",
    whyDrEkta:
      "Dr. Ekta has a special talent for making children feel comfortable and excited about dental care. She understands that a child's early dental experiences shape their attitude toward dental health for life.\n\nHer child-friendly clinic environment, gentle techniques, and ability to communicate with children at their level make dental visits a positive experience. She provides parents with the knowledge and tools they need to maintain their child's oral health at home.\n\nDr. Ekta's goal is to help every child develop a healthy, confident smile that lasts a lifetime.",
    faqs: [
      {
        question: "When should my child first see a dentist?",
        answer:
          "The American Academy of Pediatric Dentistry recommends the first dental visit by age 1 or within 6 months of the first tooth erupting. Early visits help establish a dental home and catch any potential issues early.",
      },
      {
        question: "How do I prepare my child for a dental visit?",
        answer:
          "Keep it positive! Talk about the dentist in a friendly way, read children's books about dental visits, avoid using words like 'pain' or 'hurt,' and let Dr. Ekta's team work their magic. Children are often braver than we expect!",
      },
      {
        question: "Are baby teeth really important?",
        answer:
          "Yes! Baby teeth are essential for chewing, speaking, and holding space for permanent teeth. Untreated cavities in baby teeth can cause pain, infection, and problems with permanent teeth. They should be cared for just like adult teeth.",
      },
      {
        question: "What are dental sealants?",
        answer:
          "Dental sealants are thin protective coatings applied to the chewing surfaces of back teeth. They fill in the grooves where food and bacteria tend to accumulate, reducing the risk of cavities by up to 80%. The procedure is quick, painless, and highly effective.",
      },
      {
        question: "How can I prevent cavities in my child's teeth?",
        answer:
          "Start brushing with a soft toothbrush as soon as the first tooth erupts. Limit sugary snacks and drinks, ensure regular dental check-ups, consider dental sealants, and model good oral hygiene habits for your child.",
      },
    ],
  },
  {
    id: "preventive-dentistry",
    title: "Preventive Dentistry",
    shortDescription:
      "Proactive care to keep your teeth healthy and prevent problems before they start.",
    icon: "health_and_safety",
    whatIs:
      "Preventive dentistry is the foundation of good oral health. It focuses on maintaining healthy teeth and gums and preventing dental problems before they develop — saving you from pain, expense, and more invasive treatments in the future.\n\nPreventive care includes regular dental check-ups, professional cleanings, X-rays, fluoride treatments, dental sealants, oral cancer screenings, and patient education. The goal is to identify and address potential issues early, when they are easiest and least expensive to treat.\n\nThe philosophy behind preventive dentistry is simple: an ounce of prevention is worth a pound of cure. Regular preventive care is far more comfortable, affordable, and effective than treating problems after they become painful or advanced.",
    whoNeeds:
      "Everyone needs preventive dentistry — it is the cornerstone of oral health for patients of all ages:\n\n• **Children:** To establish good oral health habits, prevent cavities, and monitor tooth development\n• **Teenagers:** To prevent decay, monitor orthodontic needs, and address wisdom tooth development\n• **Adults:** To maintain oral health, prevent decay and gum disease, and catch problems early\n• **Seniors:** To preserve remaining teeth, manage age-related dental changes, and maintain oral function\n\nEveryone should visit the dentist at least twice a year for preventive care. Patients with specific risk factors (smoking, diabetes, dry mouth, history of gum disease) may need more frequent visits.",
    problems: [
      "Cavities (tooth decay)",
      "Gum disease (gingivitis and periodontitis)",
      "Tooth wear and erosion",
      "Oral cancer",
      "Bad breath (halitosis)",
      "Plaque and tartar buildup",
      "Enamel erosion from acidic foods/drinks",
      "Night-time teeth grinding (bruxism)",
    ],
    benefits: [
      "Prevents costly and painful dental problems",
      "Early detection of issues when treatment is simplest",
      "Maintains healthy teeth and gums for life",
      "Professional cleaning removes plaque and tartar that home care misses",
      "Fluoride treatments strengthen enamel and prevent decay",
      "Sealants protect vulnerable teeth from cavities",
      "Oral cancer screening can save your life",
      "Patient education empowers you to take charge of your oral health",
    ],
    procedure:
      "Preventive dentistry at Dr. Ekta's clinic includes the following:\n\n**Comprehensive Examination:**\n• Visual inspection of teeth, gums, tongue, and oral tissues\n• Assessment of existing restorations (fillings, crowns)\n• Bite and jaw alignment evaluation\n• Oral cancer screening\n\n**Professional Cleaning (Prophylaxis):**\n• Removal of plaque and tartar from all tooth surfaces\n• Polishing to remove surface stains\n• Flossing between all teeth\n• Fluouride treatment to strengthen enamel\n\n**Diagnostic X-rays:**\n• Digital X-rays with minimal radiation to detect:\n  - Cavities between teeth\n  - Bone loss\n  - Impacted teeth\n  - Abscesses or cysts\n  - Developmental abnormalities\n\n**Preventive Treatments:**\n• **Fluoride application:** Strengthens tooth enamel and makes teeth more resistant to decay\n• **Dental sealants:** Protective coatings applied to the grooves of back teeth to prevent cavities\n• **Oral hygiene instruction:** Personalised guidance on brushing, flossing, and other home care techniques\n• **Dietary counselling:** Advice on foods and habits that promote or harm oral health\n• **Nightguard fitting:** Custom nightguards for patients who grind their teeth at night",
    painful:
      "Preventive dental care is completely painless:\n\n• **Professional cleaning:** You may feel vibration and pressure as the ultrasonic scaler removes tartar, but this is not painful. Some patients with sensitive teeth may experience mild sensitivity.\n• **X-rays:** Digital X-rays are quick and comfortable with minimal radiation.\n• **Fluoride treatment:** A quick application that tastes pleasant and takes only a few minutes.\n• **Sealants:** A painless, non-invasive procedure that takes minutes per tooth.\n\nPreventive care is one of the most comfortable experiences in dentistry. Regular preventive visits prevent problems that would otherwise cause pain.",
    duration:
      "• **Routine check-up and cleaning:** 45 to 60 minutes\n• **Comprehensive examination (new patients):** 60 to 90 minutes\n• **Fluoride treatment:** 5 to 10 minutes (included with cleaning)\n• **Sealant application:** 5 to 10 minutes per tooth\n• **Oral cancer screening:** Included in the comprehensive examination\n\nPreventive visits are quick, convenient, and easily fit into your busy schedule.",
    recovery:
      "There is no recovery time needed for preventive dental care:\n\n• **After cleaning:** You may experience mild sensitivity for a few hours, especially if it has been a while since your last cleaning. This is normal and resolves quickly.\n• **After fluoride treatment:** Avoid eating or drinking for 30 minutes to allow the fluoride to absorb.\n• **After sealants:** No downtime. You can eat and drink normally immediately.\n\nAll preventive treatments allow you to resume your normal activities immediately.",
    risks:
      "Preventive dental care has virtually no risks:\n\n• **The only risk is skipping it:** The greatest risk to your oral health is avoiding preventive care. Untreated plaque buildup leads to cavities, gum disease, and more serious problems.\n• **False security:** Even with excellent home care, professional cleanings are necessary to remove tartar that cannot be brushed or flossed away.\n• **Delayed detection:** Without regular X-rays and examinations, problems can progress silently until they become painful or expensive to treat.\n\nPreventive care is the safest, most effective way to maintain your oral health.",
    expectations:
      "Here is what you can expect from preventive dentistry at Dr. Ekta's clinic:\n\n• **Thorough examination:** Dr. Ekta carefully examines every aspect of your oral health, not just your teeth.\n• **Professional clean feeling:** After a professional cleaning, your teeth feel smooth, clean, and refreshed.\n• **Peace of mind:** Knowing that your oral health is being monitored and maintained gives you confidence.\n• **Early problem detection:** Any issues are caught and discussed before they become painful or expensive.\n• **Personalised advice:** Dr. Ekta provides tailored recommendations for your specific oral health needs.\n• **Long-term savings:** Preventive care costs a fraction of what treating advanced dental problems would cost.\n• **Lifelong health:** Regular preventive care is the key to keeping your natural teeth healthy for life.",
    whyDrEkta:
      "Dr. Ekta Narula is passionate about prevention. She believes that the best dental treatment is the treatment that was never needed. Her thorough examinations, professional cleanings, and patient education help you maintain optimal oral health and avoid dental problems.\n\nDr. Ekta takes the time to educate every patient about their oral health, empowering you to make informed decisions and take the best possible care of your teeth at home. Her preventive approach saves patients pain, time, and money in the long run.\n\nFrom your child's first dental visit to your own regular check-ups, Dr. Ekta provides gentle, comprehensive preventive care for the whole family.",
    faqs: [
      {
        question: "How often should I visit the dentist?",
        answer:
          "Dr. Ekta recommends dental check-ups and cleanings every 6 months for most patients. However, patients with specific risk factors (gum disease, diabetes, smoking) may benefit from more frequent visits every 3 to 4 months.",
      },
      {
        question: "What happens during a dental check-up?",
        answer:
          "Dr. Ekta examines your teeth, gums, tongue, and oral tissues; takes X-rays if needed; performs a professional cleaning; applies fluoride; and provides personalised oral hygiene advice. The entire visit takes about 45 to 60 minutes.",
      },
      {
        question: "Is preventive care covered by insurance?",
        answer:
          "Most dental insurance plans cover preventive care (check-ups, cleanings, X-rays, fluoride) at 100% or with minimal copay. Dr. Ekta's team can help verify your insurance benefits.",
      },
      {
        question: "What are dental sealants?",
        answer:
          "Sealants are thin, protective coatings applied to the chewing surfaces of back teeth. They fill in the grooves where food and bacteria accumulate, reducing the risk of cavities by up to 80%. They are especially recommended for children and teenagers.",
      },
      {
        question: "Why are X-rays necessary if my teeth feel fine?",
        answer:
          "Many dental problems — cavities between teeth, bone loss, abscesses, and impacted teeth — cannot be seen during a visual examination. X-rays allow Dr. Ekta to detect these issues early, before they become painful or expensive to treat.",
      },
    ],
  },
  {
    id: "wisdom-tooth",
    title: "Wisdom Tooth Treatment",
    shortDescription:
      "Safe, comfortable wisdom tooth extraction by an experienced oral surgeon.",
    icon: "medical_services",
    whatIs:
      "Wisdom teeth are the third set of molars that typically emerge between the ages of 17 and 25. They are called wisdom teeth because they appear at a more mature age. While some people have no issues with their wisdom teeth, many do not have enough room in their jaw for them to emerge properly, leading to a variety of problems.\n\nWhen wisdom teeth are unable to erupt fully (impacted) or emerge at an angle, they can cause pain, infection, damage to neighbouring teeth, and other complications. In these cases, extraction (removal) of the wisdom teeth is recommended.\n\nWisdom tooth extraction is one of the most common oral surgical procedures. At Dr. Ekta's clinic, the procedure is performed by Dr. Manav Ahuja, an experienced oral and maxillofacial surgeon, using advanced techniques to ensure safety, comfort, and optimal healing.",
    whoNeeds:
      "You may need wisdom tooth extraction if:\n\n• Your wisdom teeth are impacted (unable to fully emerge through the gums)\n• Your wisdom teeth are growing at an angle and pressing against adjacent teeth\n• You experience recurrent infections around partially erupted wisdom teeth\n• You have pain, swelling, or discomfort in the back of your mouth\n• Cysts or tumours have developed around wisdom teeth\n• Your wisdom teeth are causing crowding of your other teeth\n• Food and bacteria are getting trapped around partially erupted wisdom teeth\n• You have difficulty cleaning your back teeth due to wisdom teeth\n\nEven if your wisdom teeth are not currently causing problems, Dr. Ekta may recommend prophylactic (preventive) extraction if they are likely to cause issues in the future based on their position and your jaw size.",
    problems: [
      "Pain and swelling at the back of the mouth",
      "Recurrent infections around partially erupted teeth",
      "Damage to adjacent second molars",
      "Cysts or tumours developing around wisdom teeth",
      "Crowding of front teeth",
      "Difficulty opening the mouth (trismus)",
      "Food trapping and difficulty cleaning",
      "Jaw stiffness and discomfort",
    ],
    benefits: [
      "Eliminates pain and discomfort from problematic wisdom teeth",
      "Prevents infection and damage to neighbouring teeth",
      "Avoids cyst and tumour formation",
      "Prevents crowding and orthodontic relapse",
      "Simplifies oral hygiene in the back of the mouth",
      "Early extraction is easier and heals faster",
      "Prevents emergency situations and complications",
      "One-time procedure that resolves the problem permanently",
    ],
    procedure:
      "Wisdom tooth extraction at Dr. Ekta's clinic is a well-planned, carefully executed procedure:\n\n**Step 1 — Pre-Surgical Assessment:**\n• Comprehensive examination and digital X-rays (including panoramic X-ray or CBCT scan)\n• Assessment of wisdom tooth position, root anatomy, and proximity to nerves and sinuses\n• Discussion of anaesthesia options and treatment plan\n• Pre-operative instructions provided\n\n**Step 2 — Anaesthesia:**\n• Local anaesthesia to completely numb the area\n• Sedation options (nitrous oxide, oral sedation, or IV sedation) for anxious patients or complex extractions\n• General anaesthesia for extensive cases (arranged at a hospital if needed)\n\n**Step 3 — Extraction:**\n• Dr. Ahuja makes a small incision in the gum to access the tooth (if it is not fully erupted)\n• The tooth is carefully removed, sometimes in sections for easier extraction\n• The socket is cleaned and may be sutured if needed\n• Gauze is placed to control bleeding and promote clot formation\n\n**Step 4 — Post-Operative Care:**\n• Detailed aftercare instructions are provided\n• Prescriptions for pain medication and antibiotics if needed\n• Follow-up appointment scheduled\n\nThe entire procedure typically takes 30 to 60 minutes per tooth. Multiple teeth can often be removed in a single visit.",
    painful:
      "Dr. Ahuja and the team take every measure to ensure your comfort:\n\n• **During extraction:** The area is completely numb under local anaesthesia. You will feel pressure but no pain. Sedation options ensure you remain relaxed and comfortable.\n• **After extraction:** Mild to moderate discomfort for 2 to 3 days is normal, gradually improving over the next few days. Prescribed pain medication effectively manages any discomfort.\n• **Swelling:** Some swelling is normal and peaks at 48 to 72 hours before gradually subsiding. Cold compresses help reduce swelling.\n• **Overall experience:** Most patients report that the extraction itself is far less uncomfortable than they expected. The anticipation is often worse than the procedure.",
    duration:
      "• **Simple extraction:** 15 to 30 minutes per tooth\n• **Surgical extraction (impacted teeth):** 30 to 60 minutes per tooth\n• **Multiple teeth:** Can often be removed in one visit (45 minutes to 2 hours total)\n• **Follow-up visit:** 1 to 2 weeks after extraction to check healing and remove sutures\n\nDr. Ahuja works efficiently while maintaining the highest standards of care and precision.",
    recovery:
      "Recovery from wisdom tooth extraction follows a predictable timeline:\n\n• **Day 1:** Rest at home. Apply ice packs for 20 minutes on, 20 minutes off to reduce swelling. Take prescribed medication as directed.\n• **Days 2 to 3:** Swelling peaks and begins to subside. Continue ice packs. Eat soft, cool foods.\n• **Days 4 to 7:** Swelling and discomfort continue to improve. You can gradually return to normal activities.\n• **Week 1 to 2:** Most patients have returned to normal activities. Follow-up visit to check healing.\n• **Week 2 to 4:** Full soft tissue healing. You can resume all normal activities and diet.\n\n**Important aftercare instructions include:**\n• Avoid smoking, straws, and spitting for 24 to 48 hours (to protect the blood clot)\n• Eat soft foods for the first few days\n• Keep the extraction site clean with gentle salt water rinses after 24 hours\n• Take all prescribed medications as directed\n• Avoid strenuous exercise for 3 to 5 days\n\nDr. Ahuja provides detailed aftercare instructions and is available for any questions or concerns during your recovery.",
    risks:
      "Wisdom tooth extraction is a routine and safe procedure when performed by an experienced surgeon. Some risks include:\n\n• **Dry socket:** The most common complication, occurring when the blood clot is dislodged from the extraction site. This causes pain and delays healing. Following aftercare instructions minimises this risk.\n• **Infection:** Rare with proper technique and antibiotics. Signs include increasing pain, fever, and swelling after day 3.\n• **Nerve damage:** Very rare, especially with proper imaging and planning. Can cause temporary or (very rarely) permanent numbness of the lip, tongue, or chin.\n• **Sinus exposure:** Upper wisdom teeth may be close to the sinus cavity. Dr. Ahuja carefully evaluates this with imaging.\n• **Jaw stiffness:** Temporary trismus (difficulty opening the mouth) can occur and resolves within a few days.\n\nDr. Ahuja's extensive experience and use of advanced imaging significantly minimise all these risks.",
    expectations:
      "Here is what you can expect from wisdom tooth extraction:\n\n• **Immediate relief:** Once the problematic wisdom tooth is removed, the pain and discomfort it was causing is eliminated.\n• **Prevention of future problems:** Extraction prevents infection, damage to adjacent teeth, crowding, and other complications.\n• **Faster healing for younger patients:** Extraction is generally easier and heals faster in younger patients (teens and early 20s) when the roots are less developed.\n• **Single procedure:** Once extracted, wisdom teeth do not grow back. The problem is permanently resolved.\n• **Improved oral health:** Removing problematic wisdom teeth makes it easier to maintain good oral hygiene in the back of your mouth.\n• **Comfort and confidence:** Knowing that potential problems have been removed gives you peace of mind.",
    whyDrEkta:
      "At Dr. Ekta's clinic, wisdom tooth extractions are performed by Dr. Manav Ahuja, an experienced oral and maxillofacial surgeon with an MDS from KLE Dental College and over 10 years of experience in wisdom tooth and jaw surgeries.\n\nDr. Ahuja uses advanced imaging (3D CBCT scans) to precisely evaluate wisdom tooth position and plan the safest, most efficient extraction. His expertise ensures minimal tissue trauma, faster healing, and fewer complications.\n\nFrom simple extractions to complex surgical cases, Dr. Ahuja and Dr. Ekta provide compassionate, expert care that prioritises your comfort and safety.",
    faqs: [
      {
        question: "Do all wisdom teeth need to be removed?",
        answer:
          "Not all wisdom teeth need removal. If they are fully erupted, properly aligned, and can be cleaned effectively, they may be kept. However, impacted or problematic wisdom teeth should be removed to prevent complications. Dr. Ekta evaluates each case individually.",
      },
      {
        question: "When is the best time to remove wisdom teeth?",
        answer:
          "Earlier removal (ages 17 to 25) is generally easier because the roots are not fully developed and the bone is softer. This leads to simpler extractions, faster healing, and fewer complications. However, wisdom teeth can be safely removed at any age.",
      },
      {
        question: "What is the recovery like?",
        answer:
          "Most patients return to normal activities within 3 to 7 days. Full healing takes 2 to 4 weeks. Dr. Ahuja provides detailed aftercare instructions and prescribes medication to manage any discomfort during recovery.",
      },
      {
        question: "Can I drive myself home after the procedure?",
        answer:
          "If you receive only local anaesthesia, you can usually drive yourself home. If sedation is used, you will need someone to drive you. Dr. Ahuja discusses this with you before the procedure.",
      },
      {
        question: "What is dry socket and how do I prevent it?",
        answer:
          "Dry socket occurs when the blood clot at the extraction site is dislodged or dissolves, exposing the bone. It causes increased pain a few days after extraction. To prevent it: avoid smoking, straws, spitting, and vigorous rinsing for 48 hours. Follow all aftercare instructions carefully.",
      },
    ],
  },
  {
    id: "full-mouth-rehabilitation",
    title: "Full Mouth Rehabilitation",
    shortDescription:
      "Comprehensive restoration of all teeth for optimal function, health, and appearance.",
    icon: "emoji_people",
    whatIs:
      "Full mouth rehabilitation (also called full mouth reconstruction or restoration) is a comprehensive treatment plan that restores all of the teeth in the upper and lower jaws. It is not a single procedure but a carefully coordinated combination of restorative, cosmetic, and functional treatments designed to rebuild your entire mouth.\n\nThis treatment is recommended for patients with extensive dental problems — multiple missing teeth, severely worn or damaged teeth, advanced decay, bite problems, or TMJ issues. Full mouth rehabilitation addresses not just the appearance of your teeth, but also their function, your bite alignment, and your overall oral health.\n\nThe result is a completely restored mouth that looks beautiful, functions perfectly, and provides lasting oral health. It is one of the most transformative treatments in dentistry, often changing patients' lives profoundly.",
    whoNeeds:
      "Full mouth rehabilitation may be right for you if:\n\n• You have multiple missing teeth throughout your mouth\n• Most of your teeth are severely worn down (from grinding, erosion, or age)\n• You have extensive decay affecting many teeth\n• You have multiple broken, cracked, or damaged teeth\n• You have significant bite problems (your teeth don't come together properly)\n• You experience chronic jaw pain or TMJ disorders\n• Your existing dental work is failing (old crowns, bridges, or fillings)\n• You have lost vertical bite height due to worn teeth\n• You want a complete transformation of your oral health and appearance\n\nFull mouth rehabilitation is a major undertaking, and Dr. Ekta provides thorough consultations to ensure you understand the process, timeline, and investment involved.",
    problems: [
      "Multiple missing teeth throughout the mouth",
      "Severely worn-down or eroded teeth",
      "Extensive decay affecting multiple teeth",
      "Multiple broken, cracked, or damaged teeth",
      "Significant bite misalignment",
      "Chronic jaw pain or TMJ dysfunction",
      "Failing old dental restorations",
      "Loss of vertical dimension (collapsed bite)",
    ],
    benefits: [
      "Complete restoration of all teeth in the mouth",
      "Restored ability to chew, bite, and speak properly",
      "Elimination of pain and discomfort",
      "Dramatic improvement in appearance and smile",
      "Corrected bite alignment and jaw function",
      "Improved oral health and hygiene",
      "Long-lasting results that transform quality of life",
      "Preservation of remaining natural tooth structure",
    ],
    procedure:
      "Full mouth rehabilitation is a comprehensive, multi-phase treatment plan:\n\n**Phase 1 — Comprehensive Assessment:**\n• Detailed examination of all teeth, gums, bite, and jaw joints\n• Digital X-rays, photographs, and impressions\n• Bite analysis and jaw joint evaluation\n• Discussion of your goals, concerns, and expectations\n\n**Phase 2 — Treatment Planning:**\n• Dr. Ekta creates a detailed, sequenced treatment plan\n• Digital smile design to show expected results\n• Discussion of all treatment options, timeline, and investment\n• Financial planning and phased treatment options if needed\n\n**Phase 3 — Foundational Treatment:**\n• Treatment of any active gum disease\n• Root canal treatment for damaged teeth\n• Extraction of teeth that cannot be saved\n• Bone grafting if needed for implant placement\n\n**Phase 4 — Restorative Treatment:**\n• Dental implants to replace missing teeth\n• Crowns to restore damaged teeth\n• Bridges to replace missing teeth\n• Veneers for cosmetic improvement\n• Bite adjustment and alignment\n\n**Phase 5 — Finalisation:**\n• Final crowns, veneers, and restorations placed\n• Bite verified and adjusted for optimal function\n• Final cosmetic evaluation and refinements\n\nThe entire process typically takes several months to a year or more, depending on the complexity of the case.",
    painful:
      "Full mouth rehabilitation is designed with your comfort as the top priority:\n\n• **Local anaesthesia:** All procedures are performed with effective local anaesthesia to ensure you feel no pain during treatment.\n• **Sedation options:** For extensive treatment sessions, sedation options (nitrous oxide, oral sedation, or IV sedation) are available to keep you relaxed and comfortable.\n• **Phased treatment:** Breaking treatment into phases allows for healing time between procedures and reduces overall discomfort.\n• **Post-procedure discomfort:** Mild sensitivity and discomfort after individual procedures is normal and managed with prescribed medication.\n• **Overall experience:** Dr. Ekta and her team are committed to making the entire process as comfortable as possible.",
    duration:
      "Full mouth rehabilitation is a comprehensive treatment that unfolds over several months:\n\n• **Assessment and planning:** 2 to 4 visits over 2 to 4 weeks\n• **Foundational treatment:** 1 to 3 months (gum treatment, root canals, extractions)\n• **Implant healing period:** 3 to 6 months (osseointegration)\n• **Restorative phase:** 2 to 4 months (crowns, bridges, veneers)\n• **Total timeline:** 6 months to 1 year or more\n\nDr. Ekta provides a detailed timeline during your consultation and works efficiently to minimise the overall treatment time while ensuring excellent results.",
    recovery:
      "Recovery from full mouth rehabilitation is phased along with treatment:\n\n• **After individual procedures:** Each procedure has its own recovery period. Dr. Ekta provides specific aftercare instructions for each phase.\n• **Between phases:** Healing time is built into the treatment plan to allow tissues to recover between procedures.\n• **After completion:** Once all restorations are placed, you may need a brief adjustment period as your mouth adapts to the new bite and restorations.\n• **Long-term:** With proper care, the results of full mouth rehabilitation can last 20 years or more. Regular check-ups and good oral hygiene are essential.\n\nDr. Ekta provides comprehensive support throughout the entire treatment process and beyond.",
    risks:
      "Full mouth rehabilitation involves extensive dental work and some considerations:\n\n• **Complexity:** The treatment involves multiple procedures, each with its own risks. Dr. Ekta's thorough planning minimises complications.\n• **Irreversibility:** Many procedures (crowns, veneers, tooth preparation) involve permanent changes. This is why comprehensive planning and digital smile design are essential.\n• **Budget:** Full mouth rehabilitation is a significant investment. Dr. Ekta provides transparent pricing and phased treatment options.\n• **Time commitment:** The treatment requires multiple visits over several months. Dr. Ekta works to minimise the number and length of visits.\n• **Adjustment period:** Your bite and chewing patterns may need time to adapt to the new restorations.\n\nDr. Ekta's meticulous planning, advanced technology, and experienced team minimise these risks and ensure predictable, beautiful results.",
    expectations:
      "Full mouth rehabilitation can be truly life-changing:\n\n• **Functional restoration:** You will be able to chew, bite, and speak properly — often for the first time in years.\n• **Pain elimination:** Chronic dental pain and jaw discomfort are resolved.\n• **Dramatic aesthetic improvement:** Your smile will look dramatically younger, healthier, and more attractive.\n• **Improved oral health:** All dental problems are addressed, creating a healthy foundation for long-term oral health.\n• **Confidence boost:** Patients consistently report a profound increase in self-confidence and quality of life.\n• **Long-lasting results:** With proper care, the results of full mouth rehabilitation can last 20 years or more.\n• **Life-changing experience:** Many patients describe full mouth rehabilitation as one of the best investments they have ever made in their health and well-being.",
    whyDrEkta:
      "Full mouth rehabilitation requires a dentist with exceptional skill, experience, and vision — and Dr. Ekta Narula embodies all three. With advanced training in prosthetic dentistry from Smile India, New Delhi, and over 15 years of clinical experience, she has the expertise to plan and execute complex full mouth rehabilitation cases.\n\nDr. Ekta works with a team of specialists — including endodontists, periodontists, oral surgeons, and orthodontists — to ensure that every aspect of your treatment is handled by an expert. Her use of digital smile design technology allows you to preview your results before treatment begins.\n\nFrom initial assessment to final restoration, Dr. Ekta provides meticulous, compassionate care that transforms smiles and changes lives.",
    faqs: [
      {
        question: "How long does full mouth rehabilitation take?",
        answer:
          "Treatment typically takes 6 months to 1 year or more, depending on the complexity and procedures involved. Dr. Ekta provides a detailed timeline during your consultation and works efficiently to complete treatment as quickly as possible without compromising quality.",
      },
      {
        question: "Is full mouth rehabilitation worth the investment?",
        answer:
          "Patients consistently describe full mouth rehabilitation as one of the best investments they have ever made. The improvement in function, appearance, comfort, and quality of life is profound and long-lasting.",
      },
      {
        question: "What results can I expect?",
        answer:
          "You can expect a completely restored mouth with healthy, beautiful teeth that function properly. Patients experience improved chewing, eliminated pain, a dramatically enhanced smile, and a significant boost in confidence.",
      },
      {
        question: "Can treatment be done in phases to spread the cost?",
        answer:
          "Yes. Dr. Ekta can phase your treatment to address the most urgent needs first and spread the remaining treatment over time. This allows you to manage the financial investment while still achieving your oral health goals.",
      },
      {
        question: "Will my new teeth look natural?",
        answer:
          "Absolutely. Dr. Ekta uses modern materials and techniques to create restorations that are virtually indistinguishable from natural teeth. Digital smile design ensures that your new smile complements your facial features and looks completely natural.",
      },
    ],
  },
];

export function getTreatmentById(id: string): TreatmentDetail | undefined {
  return TREATMENT_DETAILS.find((t) => t.id === id);
}
