import { SITE_CONFIG } from "@/shared/constants";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { PageHero } from "@/shared/components/layout";

export function TermsOfUse() {
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Terms of <span className="text-slate-500">Use</span>
          </>
        }
        description="Last updated: September 2026"
        backgroundImage={PAGE_VIDEO.legal.poster}
        backgroundVideo={PAGE_VIDEO.legal.src}
      />
      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-3xl">
            <div className="prose-custom space-y-8">
              <div>
                <h2 className="heading-md mb-3">1. Acceptance of Terms</h2>
                <p className="body-md">By accessing and using the {SITE_CONFIG.name} website ({SITE_CONFIG.url}), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">2. Use of the Website</h2>
                <p className="body-md">The content on this website is provided for general information purposes only. It is not intended to be a substitute for professional dental advice, diagnosis, or treatment. Always seek the advice of a qualified dental professional with any questions you may have regarding a dental condition.</p>
                <p className="body-md mt-3">You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the website.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">3. Medical Disclaimer</h2>
                <p className="body-md">The information provided on this website is for educational and informational purposes only. It should not be considered as medical advice and should not be used as a substitute for professional medical consultation, diagnosis, or treatment.</p>
                <p className="body-md mt-3">Always consult with a qualified healthcare provider for any personal health concerns or before making any decisions related to your health or treatment. Never disregard professional medical advice or delay seeking it because of information you have read on this website.</p>
                <p className="body-md mt-3">Individual results from dental treatments may vary. The information on this website does not guarantee specific outcomes for any treatment or procedure.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">4. Appointment Booking</h2>
                <p className="body-md">Booking an appointment through this website or through third-party platforms (such as Practo) does not establish a doctor-patient relationship. A formal doctor-patient relationship is established only after an in-person consultation at the clinic.</p>
                <p className="body-md mt-3">We reserve the right to refuse or cancel appointments at our discretion. Appointment availability shown on the website is indicative and may change without notice.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">5. Intellectual Property</h2>
                <p className="body-md">All content on this website, including but not limited to text, graphics, logos, images, videos, and software, is the property of {SITE_CONFIG.name} or its content suppliers and is protected by applicable intellectual property laws.</p>
                <p className="body-md mt-3">You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from this website without prior written permission from {SITE_CONFIG.name}.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">6. Third-Party Links</h2>
                <p className="body-md">This website may contain links to third-party websites, including Practo, Google Maps, Instagram, YouTube, and other platforms. We are not responsible for the content, privacy policies, or practices of any third-party websites. Linking to any third-party website does not constitute an endorsement by {SITE_CONFIG.name}.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">7. Limitation of Liability</h2>
                <p className="body-md">To the maximum extent permitted by applicable law, {SITE_CONFIG.name} and its practitioners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from:</p>
                <ul className="body-md mt-3 list-disc space-y-1 pl-6">
                  <li>Your use of or inability to use this website</li>
                  <li>Any reliance you place on information from this website</li>
                  <li>Any unauthorised access to or alteration of your data</li>
                  <li>Any third-party content or services accessed through this website</li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md mb-3">8. Indemnification</h2>
                <p className="body-md">You agree to indemnify, defend, and hold harmless {SITE_CONFIG.name}, its practitioners, employees, and affiliates from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from your use of the website or violation of these terms.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">9. Governing Law</h2>
                <p className="body-md">These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">10. Changes to These Terms</h2>
                <p className="body-md">We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after any changes constitutes acceptance of the new terms.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">11. Contact Us</h2>
                <p className="body-md">If you have any questions about these Terms of Use, please contact us:</p>
                <div className="mt-3 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-800/50">
                  <p className="font-medium text-zinc-900 dark:text-white">{SITE_CONFIG.name}</p>
                  <p className="body-sm mt-1">{SITE_CONFIG.address.street}, {SITE_CONFIG.address.area}, {SITE_CONFIG.address.city} - {SITE_CONFIG.address.pincode}</p>
                  <p className="body-sm mt-1">Email: {SITE_CONFIG.email}</p>
                  <p className="body-sm mt-1">Phone: {SITE_CONFIG.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
