import { SITE_CONFIG } from "@/shared/constants";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { PageHero } from "@/shared/components/layout";

export function Disclaimer() {
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Legal"
        title="Disclaimer"
        description="Last updated: September 2026"
        backgroundImage={PAGE_VIDEO.legal.poster}
        backgroundVideo={PAGE_VIDEO.legal.src}
      />
      <section className="bg-white px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-3xl">
            <div className="prose-custom space-y-8">
              <div>
                <h2 className="heading-md mb-3">General Information</h2>
                <p className="body-md">The information provided by {SITE_CONFIG.name} on <span className="font-medium text-zinc-900 dark:text-white">{SITE_CONFIG.url}</span> is for general informational purposes only. All information on the site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Medical Disclaimer</h2>
                <p className="body-md">The site cannot and does not contain dental or medical advice. The dental and medical information is provided for general informational and educational purposes only and is not a substitute for professional advice.</p>
                <p className="body-md mt-3">Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate dental or medical professionals. We do not make any representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the site for any purpose.</p>
                <p className="body-md mt-3">Any reliance you place on such information is therefore strictly at your own risk. We shall not be liable for any losses, injuries, or damages arising from the display or use of this information.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Testimonials and Reviews</h2>
                <p className="body-md">The site may contain testimonials or reviews from patients. These testimonials reflect the real-life experiences and opinions of individual patients. However, individual experiences may vary. We do not claim, and you should not assume, that every patient&apos;s experience is typical of what others will achieve.</p>
                <p className="body-md mt-3">Testimonials and reviews on this site are not intended, nor should they be construed, as claims that our services can diagnose, treat, cure, or prevent any disease.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">External Links Disclaimer</h2>
                <p className="body-md">The site may contain links to external websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
                <p className="body-md mt-3">WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Images and Photographs</h2>
                <p className="body-md">Images used on this website, including before-and-after photographs, are for illustration purposes only. Individual results may vary. Before-and-after images shown on the site are of actual patients who have provided their consent for use.</p>
                <p className="body-md mt-3">Stock images, if any, are used for illustrative purposes and do not represent actual patients or outcomes of treatment.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Professional Advice</h2>
                <p className="body-md">The information on this website is not intended to replace a one-on-one relationship with a qualified dental professional. It is not intended as medical advice and should not be relied upon as a substitute for professional consultation with a qualified healthcare provider.</p>
                <p className="body-md mt-3">Always seek the advice of your dentist, physician, or other qualified health provider with any questions you may have regarding a medical condition or treatment.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Errors and Omissions</h2>
                <p className="body-md">While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, {SITE_CONFIG.name} is not responsible for any errors or omissions, or for the results obtained from the use of this information.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Fair Use Disclaimer</h2>
                <p className="body-md">This site may contain copyrighted material the use of which has not always been specifically authorised by the copyright owner. We believe this constitutes a &quot;fair use&quot; of any such copyrighted material for the purposes of education, commentary, and non-commercial use.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Changes to This Disclaimer</h2>
                <p className="body-md">We reserve the right to amend this disclaimer at any time. Any changes will be posted on this page with an updated revision date.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">Contact Us</h2>
                <p className="body-md">If you have any questions about this disclaimer, please contact us:</p>
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
