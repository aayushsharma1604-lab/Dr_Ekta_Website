export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  credentials: string;
  reviewedBy: string;
  readTime: string;
  date: string;
  image?: string;
  content: string;
  references?: { title: string; url: string }[];
  tags: string[];
}

export const ARTICLES: Article[] = [
  // ─── Dental Care ───
  {
    id: "1",
    slug: "how-to-brush-your-teeth-properly",
    title: "How to Brush Your Teeth Properly — A Dentist's Guide",
    excerpt:
      "Brushing your teeth seems simple, but most people do it wrong. Dr. Ekta shares the correct technique for a healthier smile.",
    category: "Dental Care",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "5 min read",
    date: "2024-10-05",
    content: `Brushing your teeth is the foundation of good oral health, yet studies show that most people don't brush correctly. Here's a step-by-step guide from Dr. Ekta Narula to help you get the most out of your daily brushing routine.

## The Right Technique

**1. Choose the Right Brush**
Use a soft-bristled toothbrush with a small head that can reach all areas of your mouth. Hard bristles can damage your gums and enamel over time.

**2. Hold Your Brush Correctly**
Hold the brush at a 45-degree angle to your gums. This allows the bristles to clean along the gum line where plaque accumulates.

**3. Use Gentle, Circular Motions**
Instead of scrubbing back and forth, use gentle circular motions to clean each tooth. This is more effective at removing plaque and less abrasive on your enamel.

**4. Don't Forget These Areas**
• **Outer surfaces:** The side facing your cheeks — brush using circular motions
• **Inner surfaces:** The side facing your tongue — tilt the brush vertically and use up-and-down strokes
• **Chewing surfaces:** Use a back-and-forth scrubbing motion
• **Tongue:** Gently brush your tongue to remove bacteria and freshen breath

**5. Brush for Two Minutes**
Set a timer or play a two-minute song. Most people brush for only 30 to 45 seconds — not nearly enough time to clean all surfaces properly.

**6. Replace Your Brush Every 3 Months**
Worn-out bristles are less effective at removing plaque. Replace your toothbrush or brush head every three months, or sooner if the bristles become frayed.

## Common Brushing Mistakes

• **Brushing too hard:** Aggressive brushing can cause gum recession and enamel wear. Let the bristles do the work — no need to press hard.
• **Using an old brush:** Bacteria accumulate on old brushes, and worn bristles don't clean effectively.
• **Ignoring the gum line:** Plaque accumulates along the gum line and between teeth. Make sure to brush along the gums, not just the flat surfaces.
• **Skipping the tongue:** Your tongue harbours bacteria that cause bad breath and contribute to plaque buildup.

## Electric vs. Manual Toothbrush

Both can be effective if used correctly. Electric toothbrushes can be helpful for people who struggle with technique or have limited dexterity. Look for one with a pressure sensor to avoid brushing too hard.

## When to Brush

• **After breakfast** (wait 30 minutes if you've had acidic food or drinks)
• **Before bed** — this is the most important brushing session, as saliva flow decreases at night
• Ideally, brush after every meal

## The Bottom Line

Proper brushing technique, combined with flossing and regular dental check-ups, is the best way to prevent cavities, gum disease, and bad breath. If you have questions about your brushing technique, Dr. Ekta is happy to demonstrate during your next visit.`,
    references: [
      {
        title: "American Dental Association — Brushing Your Teeth",
        url: "https://www.ada.org/topics/oral-hygiene",
      },
    ],
    tags: [
      "brushing",
      "oral hygiene",
      "dental care",
      "plaque",
      "toothbrush",
    ],
  },
  {
    id: "2",
    slug: "flossing-why-its-essential",
    title: "Flossing: Why It's Essential and How to Do It Right",
    excerpt:
      "Brushing alone misses 40% of your tooth surfaces. Learn why flossing is crucial and the best techniques.",
    category: "Dental Care",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "4 min read",
    date: "2024-10-12",
    content: `Your toothbrush can only reach about 60% of your tooth surfaces. The remaining 40% — the spaces between your teeth — can only be cleaned with floss or interdental brushes. Without flossing, plaque and food particles accumulate between teeth, leading to cavities, gum disease, and bad breath.

## Why Flossing Matters

• **Prevents cavities between teeth:** Cavities commonly develop in the tight spaces between teeth where toothbrush bristles can't reach.
• **Prevents gum disease:** Plaque along the gum line causes gingivitis (red, swollen, bleeding gums). Flossing removes this plaque before it causes inflammation.
• **Prevents bad breath:** Food particles trapped between teeth decompose and cause odour. Flossing removes these particles.
• **Prevents tartar buildup:** Plaque that isn't removed hardens into tartar, which can only be removed by a dental professional.

## How to Floss Properly

1. Use about 18 inches (45 cm) of floss, winding most around your middle fingers
2. Hold the floss tautly between your thumbs and index fingers
3. Gently guide the floss between your teeth using a rubbing motion
4. When the floss reaches the gum line, curve it into a C-shape against one tooth
5. Gently slide it into the space between the gum and the tooth
6. Rub the floss up and down against the side of each tooth
7. Use a clean section of floss as you move from tooth to tooth

## Types of Floss

• **Waxed floss:** Slides easily between tight teeth
• **Unwaxed floss:** Slightly more effective at removing plaque
• **Dental tape:** Wider and flatter, good for people with larger spaces between teeth
• **Interdental brushes:** Small brush-like tools that clean between teeth — often recommended for people with wider gaps
• **Water flossers:** Use a stream of water to clean between teeth — a good option for people with braces or dental implants

## How Often Should You Floss?

Once a day is sufficient for most people. Flossing before bedtime is ideal, as it removes food particles and plaque accumulated throughout the day before you go to sleep.

## The Bottom Line

Flossing is not optional — it's an essential part of your oral hygiene routine. If you find traditional floss difficult to use, talk to Dr. Ekta about alternative interdental cleaning tools that might work better for you.`,
    references: [
      {
        title: "American Dental Association — Flossing",
        url: "https://www.ada.org/topics/oral-hygiene",
      },
    ],
    tags: ["flossing", "oral hygiene", "dental care", "gum disease"],
  },

  // ─── Oral Health ───
  {
    id: "3",
    slug: "connection-between-oral-health-and-overall-health",
    title:
      "The Connection Between Oral Health and Your Overall Health",
    excerpt:
      "Your mouth is a window to your body. Discover how oral health is linked to heart disease, diabetes, and more.",
    category: "Oral Health",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "6 min read",
    date: "2024-09-20",
    content: `Most people think of oral health as separate from their overall health, but research increasingly shows that the health of your mouth is closely connected to the health of your entire body. Your mouth is home to millions of bacteria — most harmless, but some capable of causing disease. When oral hygiene is neglected, harmful bacteria can multiply and contribute to a range of health problems.

## Oral Health and Heart Disease

Research has shown a link between gum disease (periodontitis) and cardiovascular disease. The bacteria from infected gums can enter the bloodstream and contribute to the formation of arterial plaque, increasing the risk of heart attack and stroke. A study published in the Journal of Periodontology found that people with gum disease are nearly twice as likely to suffer from coronary artery disease.

## Oral Health and Diabetes

The relationship between oral health and diabetes is bidirectional:
• People with diabetes are more susceptible to gum disease because high blood sugar levels promote bacterial growth
• Severe gum disease can make it harder to control blood sugar levels, worsening diabetic symptoms

Managing your oral health is an important part of managing diabetes.

## Oral Health and Pregnancy

Pregnancy gingivitis affects many pregnant women due to hormonal changes. Research suggests that severe gum disease during pregnancy may be linked to premature birth and low birth weight. Regular dental check-ups during pregnancy are important for both mother and baby.

## Oral Health and Respiratory Infections

Bacteria from the mouth can be inhaled into the lungs, potentially causing respiratory infections such as pneumonia. This is particularly concerning for elderly patients and those with compromised immune systems.

## Oral Health and Mental Health

Poor oral health can affect your self-esteem, social interactions, and mental well-being. Studies have linked tooth loss and poor dental health to depression and anxiety.

## Protecting Your Overall Health Through Oral Care

• Brush twice daily and floss once daily
• Visit Dr. Ekta for regular check-ups and cleanings
• Treat gum disease promptly
• Maintain a healthy diet low in sugar
• Don't smoke or use tobacco products
• Inform Dr. Ekta about any medications you take or health conditions you have

## The Bottom Line

Your oral health is an integral part of your overall health. Taking care of your teeth and gums is not just about having a beautiful smile — it's about protecting your entire body. Regular dental visits and good oral hygiene are investments in your long-term health.`,
    references: [
      {
        title:
          "Mayo Clinic — The Link Between Gum Disease and Other Health Conditions",
        url: "https://www.mayoclinic.org",
      },
      {
        title:
          "Harvard Health — The Mouth-Body Connection",
        url: "https://www.health.harvard.edu",
      },
    ],
    tags: [
      "oral health",
      "overall health",
      "heart disease",
      "diabetes",
      "gum disease",
    ],
  },

  // ─── Dental Implants ───
  {
    id: "4",
    slug: "dental-implants-everything-you-need-to-know",
    title: "Dental Implants: Everything You Need to Know",
    excerpt:
      "Considering dental implants? Learn about the procedure, benefits, costs, and what to expect from an expert.",
    category: "Dental Implants",
    author: "Dr. Ekta Narula",
    credentials:
      "BDS (Gold Medalist), Advanced Prosthetic Dentistry, 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "8 min read",
    date: "2024-09-15",
    content: `Dental implants are widely considered the gold standard for replacing missing teeth. Unlike dentures or bridges, implants are permanently fixed in your jaw and function just like natural teeth. If you're considering dental implants, here's everything you need to know.

## What Are Dental Implants?

A dental implant is a small titanium post that is surgically placed into the jawbone. Over time, the implant fuses with the bone through a process called osseointegration, creating a strong and stable foundation for a replacement tooth (crown).

## Am I a Good Candidate?

Most healthy adults with adequate jawbone density are candidates for dental implants. You may need additional treatments first if you have:
• Significant bone loss (bone grafting may be needed)
• Uncontrolled diabetes
• Active gum disease
• Heavy smoking habit

## The Implant Process

**Phase 1: Consultation and Planning**
Comprehensive examination including 3D imaging to assess your jawbone and plan the implant placement.

**Phase 2: Implant Placement**
The titanium implant is placed into the jawbone under local anaesthesia. The procedure takes 1 to 2 hours per implant.

**Phase 3: Healing (Osseointegration)**
Over 3 to 6 months, the implant fuses with your jawbone. During this time, a temporary restoration may be placed.

**Phase 4: Abutment and Crown**
Once healed, an abutment (connector) is placed, followed by a custom-made crown that matches your natural teeth.

## Benefits of Dental Implants

• Permanent — can last a lifetime with proper care
• Preserves jawbone and prevents bone loss
• Looks and feels like natural teeth
• No dietary restrictions
• No slipping or discomfort like dentures
• Does not alter adjacent healthy teeth

## How Much Do Implants Cost?

The cost varies based on the number of implants, the type of restoration, and whether bone grafting is needed. Dr. Ekta provides transparent pricing during your consultation and offers flexible payment options.

## Caring for Your Implants

Implants are cared for just like natural teeth — brush, floss, and visit Dr. Ekta for regular check-ups. With proper care, the implant itself can last a lifetime.

## The Bottom Line

Dental implants are a safe, predictable, and long-lasting solution for missing teeth. If you're missing one or more teeth, schedule a consultation with Dr. Ekta to find out if implants are right for you.`,
    references: [
      {
        title: "American Academy of Implant Dentistry",
        url: "https://www.aaid.com",
      },
    ],
    tags: [
      "dental implants",
      "missing teeth",
      "tooth replacement",
      "osseointegration",
    ],
  },

  // ─── Cosmetic Dentistry ───
  {
    id: "5",
    slug: "teeth-whitening-vs-veneers",
    title: "Teeth Whitening vs. Veneers: Which Is Right for You?",
    excerpt:
      "Both can brighten your smile, but they work very differently. Here's how to decide.",
    category: "Cosmetic Dentistry",
    author: "Dr. Ekta Narula",
    credentials:
      "BDS (Gold Medalist), Cosmetic & Prosthetic Dentistry, 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "5 min read",
    date: "2024-10-01",
    content: `A bright, beautiful smile can boost your confidence and transform your appearance. Two of the most popular cosmetic dental treatments are teeth whitening and dental veneers. While both can improve your smile, they address different concerns and work in very different ways.

## Teeth Whitening

**What it does:** Removes stains and discolouration to brighten your natural teeth by several shades.

**Best for:**
• Yellow or brown-stained teeth
• Age-related discolouration
• Stains from coffee, tea, wine, or tobacco
• Patients with healthy, intact teeth who just want a brighter colour

**Pros:**
• Quick — completed in one visit (in-office) or 1 to 2 weeks (take-home)
• Non-invasive — no tooth structure is removed
• Affordable
• Immediate results

**Cons:**
• Results are not permanent (last 1 to 3 years)
• Does not change the shape, size, or alignment of teeth
• May cause temporary sensitivity
• Not effective on grey stains or restorations (crowns, veneers)

## Dental Veneers

**What it does:** Ultra-thin porcelain shells are bonded to the front surface of your teeth to improve colour, shape, size, and alignment.

**Best for:**
• Chipped or cracked teeth
• Gaps between teeth
• Slightly crooked or misaligned teeth
• Severely stained teeth that don't respond to whitening
• Worn-down or uneven teeth
• Patients wanting a complete smile transformation

**Pros:**
• Addresses multiple concerns at once
• Natural-looking and stain-resistant
• Long-lasting (15 to 20 years)
• Dramatic improvement in appearance

**Cons:**
• More expensive than whitening
• Requires removal of a thin layer of enamel (irreversible)
• Requires 2 to 3 visits
• May need replacement after 15 to 20 years

## Which Should You Choose?

| Concern | Whitening | Veneers |
|---|---|---|
| Stained teeth | ✅ Best option | ✅ If stains are severe |
| Chipped teeth | ❌ | ✅ Best option |
| Gaps | ❌ | ✅ |
| Crooked teeth | ❌ | ✅ (mild cases) |
| Budget-friendly | ✅ | ❌ |
| Quick results | ✅ | ⚠️ 2-3 visits |

## The Bottom Line

If your main concern is tooth colour and your teeth are otherwise healthy, whitening is a quick, affordable solution. If you have multiple cosmetic concerns — chips, gaps, shape, and colour — veneers may be the better investment. Dr. Ekta can help you decide during a consultation.`,
    references: [
      {
        title: "American Dental Association — Cosmetic Dentistry",
        url: "https://www.ada.org/topics/cosmetic-dentistry",
      },
    ],
    tags: [
      "teeth whitening",
      "veneers",
      "cosmetic dentistry",
      "smile makeover",
    ],
  },

  // ─── Children's Dental Health ───
  {
    id: "6",
    slug: "when-should-child-first-visit-dentist",
    title: "When Should Your Child First Visit the Dentist?",
    excerpt:
      "The answer might surprise you. Learn why early dental visits are crucial for your child's oral health.",
    category: "Children's Dental Health",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "4 min read",
    date: "2024-10-08",
    content: `Many parents wait until their child has a full set of baby teeth before visiting the dentist, but dental professionals recommend the first visit much earlier — by the child's first birthday or within six months of the first tooth erupting.

## Why So Early?

• **Early detection:** Problems can be caught before they become painful or expensive to treat
• **Prevention:** Fluoride treatments and dietary advice can prevent cavities from developing
• **Habit formation:** Early visits help children become comfortable with dental care
• **Parental education:** Parents learn proper brushing techniques and dietary guidance for their child's oral health
• **Monitoring development:** Dr. Ekta can monitor tooth development and jaw growth, catching potential orthodontic issues early

## What Happens at the First Visit?

The first dental visit is usually short and gentle:
• Dr. Ekta examines your child's teeth, gums, and bite
• A gentle cleaning to remove plaque
• Fluoride treatment if appropriate
• Discussion of teething, thumb-sucking, and oral hygiene habits
• X-rays only if clinically necessary

The goal is to make the experience positive and comfortable for your child.

## How to Prepare Your Child

• **Start early:** Talk about the dentist in a positive, exciting way
• **Read books:** Children's books about dental visits can help familiarise them with the experience
• **Be positive:** Avoid using words like "pain," "hurt," or "scary"
• **Role play:** Pretend to brush a stuffed animal's teeth and let your child play "dentist"
• **Let us handle it:** Dr. Ekta and her team are experienced in working with children and will guide the interaction

## Common Questions

**Are baby teeth really that important?**
Yes! Baby teeth are essential for chewing, speaking, and holding space for permanent teeth. Untreated cavities in baby teeth can cause pain, infection, and problems with developing permanent teeth.

**What if my child is scared?**
This is completely normal. Dr. Ekta's child-friendly approach and the welcoming clinic environment help children feel at ease. Most children leave with a smile!

## The Bottom Line

Early dental visits set the foundation for a lifetime of good oral health. Schedule your child's first dental visit with Dr. Ekta today.`,
    references: [
      {
        title:
          "American Academy of Pediatric Dentistry — First Dental Visit",
        url: "https://www.aapd.org",
      },
    ],
    tags: [
      "children's dentistry",
      "pediatric dental care",
      "first dental visit",
      "baby teeth",
    ],
  },

  // ─── Gum Health ───
  {
    id: "7",
    slug: "signs-of-gum-disease-you-should-not-ignore",
    title: "7 Signs of Gum Disease You Should Not Ignore",
    excerpt:
      "Gum disease affects nearly half of adults over 30. Know the warning signs before it's too late.",
    category: "Gum Health",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Anil Yadav, Periodontist (15+ Years)",
    readTime: "5 min read",
    date: "2024-09-25",
    content: `Gum disease (periodontal disease) is one of the most common chronic infections affecting adults worldwide. According to the CDC, nearly half of adults aged 30 and older have some form of gum disease. The scary part? In its early stages, gum disease often has no pain — so many people don't know they have it until significant damage has occurred.

## The 7 Warning Signs

**1. Bleeding Gums**
If your gums bleed when you brush or floss, this is the earliest sign of gum disease (gingivitis). Healthy gums should not bleed during normal oral hygiene.

**2. Red or Swollen Gums**
Healthy gums are pale pink and firm. If your gums are red, puffy, or tender, they are inflamed — a sign of gingivitis.

**3. Receding Gums**
If your teeth appear longer than they used to, or you notice your gum line pulling away from your teeth, this is gum recession — a sign of more advanced gum disease.

**4. Persistent Bad Breath**
Chronic bad breath (halitosis) that doesn't improve with brushing and mouthwash can be a sign of bacteria and plaque buildup below the gum line.

**5. Loose or Shifting Teeth**
As gum disease progresses, it destroys the bone and tissue that hold your teeth in place. Teeth may feel loose, shift position, or develop gaps.

**6. Pus Between Teeth and Gums**
The presence of pus (a sign of infection) between your teeth and gums is a serious sign that requires immediate dental attention.

**7. Changes in Your Bite**
If your teeth don't come together properly when you bite, or if your dentures no longer fit, this can indicate bone loss from advanced gum disease.

## What Causes Gum Disease?

• Plaque buildup from poor oral hygiene
• Smoking and tobacco use
• Diabetes
• Hormonal changes (pregnancy, menopause)
• Certain medications
• Genetic predisposition
• Stress

## How Is Gum Disease Treated?

• **Gingivitis:** Professional cleaning and improved oral hygiene — completely reversible
• **Mild periodontitis:** Scaling and root planing (deep cleaning)
• **Advanced periodontitis:** Surgical procedures, bone grafting, or gum grafting

## The Bottom Line

If you notice any of these signs, don't ignore them. Gum disease is treatable, especially when caught early. Schedule a gum assessment with Dr. Ekta to protect your oral health.`,
    references: [
      {
        title: "CDC — Periodontal Disease",
        url: "https://www.cdc.gov/oral-health/conditions/periodontal-disease.html",
      },
    ],
    tags: [
      "gum disease",
      "periodontitis",
      "gingivitis",
      "gum health",
      "bleeding gums",
    ],
  },

  // ─── Dental Myths ───
  {
    id: "8",
    slug: "common-dental-myths-busted",
    title: "10 Common Dental Myths Busted by a Dentist",
    excerpt:
      "Sugar is the only cause of cavities? You should brush immediately after eating? Let's separate fact from fiction.",
    category: "Dental Myths",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "6 min read",
    date: "2024-10-15",
    content: `There's a lot of misinformation about dental health floating around. Let's bust some of the most common myths with facts from Dr. Ekta Narula.

## Myth 1: Sugar is the Main Cause of Cavities
**Fact:** While sugar contributes to cavities, it's not the sugar itself that causes them. It's the acid produced by bacteria that feed on sugar. Any carbohydrate — including bread, pasta, and fruit — can fuel acid-producing bacteria. The frequency of sugar exposure matters more than the amount.

## Myth 2: You Should Brush Immediately After Eating
**Fact:** Brushing right after eating acidic foods or drinks can actually damage your enamel, which is softened by the acid. Wait at least 30 minutes after eating before brushing to allow your saliva to neutralise the acid and reharden the enamel.

## Myth 3: Hard Brushing Cleans Better
**Fact:** Brushing too hard can cause gum recession, enamel wear, and sensitivity. Gentle, circular motions with a soft-bristled brush are more effective and safer.

## Myth 4: If Your Gums Bleed, You Should Stop Flossing
**Fact:** Bleeding gums are a sign of inflammation (gingivitis) — not that you're flossing too hard. Continuing to floss regularly will actually help the gums heal and stop bleeding. If bleeding persists, see Dr. Ekta.

## Myth 5: Whitening Damages Your Teeth
**Fact:** Professional teeth whitening supervised by a dentist is safe and does not damage enamel. Over-the-counter products used improperly can cause sensitivity, but professional treatment is carefully controlled.

## Myth 6: Baby Teeth Don't Matter Because They Fall Out Anyway
**Fact:** Baby teeth are essential for chewing, speaking, and holding space for permanent teeth. Untreated cavities in baby teeth can cause pain, infection, and problems with permanent teeth.

## Myth 7: You Only Need to Visit the Dentist if Something Hurts
**Fact:** Many dental problems — including cavities, gum disease, and even oral cancer — can develop without pain. Regular check-ups catch problems early when they're easiest and least expensive to treat.

## Myth 8: Dental Treatment is Always Painful
**Fact:** Modern dentistry has made great advances in pain management. Local anaesthesia, sedation options, and gentle techniques make most dental procedures comfortable or painless.

## Myth 9: You Should Avoid the Dentist During Pregnancy
**Fact:** Dental check-ups and treatments are safe during pregnancy and important for both mother and baby. Inform Dr. Ekta about your pregnancy so she can take appropriate precautions.

## Myth 10: Oral Health Doesn't Affect Overall Health
**Fact:** Research links gum disease to heart disease, diabetes complications, stroke, and pregnancy complications. Your oral health is closely connected to your overall health.

## The Bottom Line

Don't let myths prevent you from taking care of your teeth. If you have questions or concerns, Dr. Ekta is always happy to provide evidence-based answers.`,
    references: [
      {
        title: "American Dental Association — Oral Health Myths",
        url: "https://www.ada.org",
      },
    ],
    tags: [
      "dental myths",
      "oral health facts",
      "dentist tips",
      "common misconceptions",
    ],
  },

  // ─── Patient FAQs ───
  {
    id: "9",
    slug: "how-often-should-i-visit-dentist",
    title: "How Often Should I Visit the Dentist?",
    excerpt:
      "The 'every six months' rule is a good start, but the right frequency depends on your individual needs.",
    category: "Patient FAQs",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "3 min read",
    date: "2024-10-20",
    content: `The general recommendation is to visit the dentist every six months for a check-up and professional cleaning. However, the ideal frequency depends on your individual oral health needs.

## The General Rule: Every 6 Months

For most people with good oral health, visiting the dentist every six months is sufficient. These visits include:
• Comprehensive examination of teeth, gums, and oral tissues
• Professional cleaning to remove plaque and tartar
• X-rays as needed to detect hidden problems
• Fluoride treatment to strengthen enamel
• Oral cancer screening

## You May Need More Frequent Visits If You:

• Have a history of gum disease (every 3 to 4 months)
• Have diabetes (increased risk of gum disease)
• Are a smoker (higher risk of oral cancer and gum disease)
• Are pregnant (hormonal changes increase gum disease risk)
• Have a weakened immune system
• Are prone to cavities
• Have dry mouth (xerostomia) from medications

## You May Be Fine with Less Frequent Visits If You:

• Have excellent oral hygiene habits
• Have no history of cavities or gum disease
• Maintain a healthy diet low in sugar
• Don't smoke or use tobacco

## Why Regular Visits Matter

Even with excellent home care, professional cleaning is necessary to remove tartar (hardened plaque) that brushing and flossing cannot remove. Regular examinations also catch problems like cavities, gum disease, and oral cancer early — when they're easiest and least expensive to treat.

## The Bottom Line

Every six months is a good starting point, but Dr. Ekta will recommend the ideal frequency based on your specific oral health needs. The most important thing is to not skip your regular dental visits.`,
    tags: [
      "dental visit frequency",
      "check-up",
      "dental cleaning",
      "patient FAQ",
    ],
  },
  {
    id: "10",
    slug: "what-to-expect-dental-checkup",
    title: "What to Expect at Your First Dental Check-Up",
    excerpt:
      "Nervous about your first visit? Here's a step-by-step guide to what happens during a dental check-up.",
    category: "Patient FAQs",
    author: "Dr. Ekta Narula",
    credentials: "BDS (Gold Medalist), 15+ Years Experience",
    reviewedBy: "Dr. Ekta Narula",
    readTime: "4 min read",
    date: "2024-10-22",
    content: `If it's been a while since your last dental visit, or if you're visiting Dr. Ekta for the first time, here's what you can expect during your check-up.

## Before Your Visit

• Fill out any paperwork or medical history forms (often available online)
• Bring a list of medications you take
• Note any concerns or questions you have
• Don't worry — Dr. Ekta's team is welcoming and non-judgemental

## Step 1: Medical and Dental History

Dr. Ekta will review your medical history, current medications, and any dental concerns. This helps her understand your overall health and tailor your treatment accordingly.

## Step 2: Digital X-Rays

If this is your first visit or if X-rays are due, digital X-rays will be taken. Modern digital X-rays use very low radiation and provide instant, detailed images of your teeth, roots, and jawbone.

## Step 3: Oral Examination

Dr. Ekta will carefully examine:
• Each tooth for cavities, cracks, or wear
• Your gums for signs of inflammation, recession, or pocketing
• Your tongue, cheeks, and other soft tissues for abnormalities
• Your bite alignment
• Existing dental work (fillings, crowns, bridges)
• Oral cancer screening

## Step 4: Professional Cleaning

A dental hygienist or Dr. Ekta will perform a thorough cleaning:
• **Scaling:** Removal of plaque and tartar from all tooth surfaces, including below the gum line
• **Polishing:** Smoothing and polishing teeth to remove surface stains
• **Flossing:** Thorough flossing between all teeth
• **Fluoride treatment:** Application of fluoride to strengthen enamel and prevent cavities

## Step 5: Discussion and Treatment Plan

Dr. Ekta will discuss her findings with you, explain any recommended treatments, and answer all your questions. You'll receive a clear treatment plan with costs and priorities.

## How Long Does It Take?

A first visit typically takes 60 to 90 minutes. Regular check-ups take about 45 to 60 minutes.

## The Bottom Line

A dental check-up is quick, comfortable, and essential for maintaining your oral health. Dr. Ekta and her team create a welcoming, stress-free environment so you feel at ease from the moment you walk in.`,
    tags: [
      "dental check-up",
      "first visit",
      "patient FAQ",
      "what to expect",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  if (category === "All") return ARTICLES;
  return ARTICLES.filter((a) => a.category === category);
}

export const ARTICLE_CATEGORIES = [
  "All",
  "Dental Care",
  "Oral Health",
  "Dental Implants",
  "Cosmetic Dentistry",
  "Children's Dental Health",
  "Gum Health",
  "Dental Myths",
  "Patient FAQs",
];
