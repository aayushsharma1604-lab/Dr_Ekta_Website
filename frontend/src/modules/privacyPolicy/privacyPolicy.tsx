import { SITE_CONFIG } from "@/shared/constants";
import { PAGE_VIDEO } from "@/shared/media/pageVideos";
import { PageHero } from "@/shared/components/layout";

export function PrivacyPolicy() {
  return (
    <div className="flex flex-col bg-[#dbeafe]">
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Privacy <span className="text-slate-500">Policy</span>
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
                <h2 className="heading-md mb-3">1. Introduction</h2>
                <p className="body-md">Welcome to {SITE_CONFIG.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <span className="font-medium text-zinc-900 dark:text-white">{SITE_CONFIG.url}</span> and use our services.</p>
                <p className="body-md mt-3">Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">2. Information We Collect</h2>
                <p className="body-md">We may collect information about you in a variety of ways. The information we may collect via the website includes:</p>
                <h3 className="heading-sm mt-4 mb-2">Personal Data</h3>
                <p className="body-md">Demographic and other personally identifiable information (such as your name, email address, and phone number) that you voluntarily give to us when you fill out a contact form, book an appointment, or otherwise interact with the website.</p>
                <h3 className="heading-sm mt-4 mb-2">Derivative Data</h3>
                <p className="body-md">Information our servers automatically collect when you access the website, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the website.</p>
                <h3 className="heading-sm mt-4 mb-2">Data from Third Parties</h3>
                <p className="body-md">We may receive information about you from third parties, including business partners such as Practo, social media platforms, and advertising partners.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">3. How We Use Your Information</h2>
                <p className="body-md">Having accurate information about you permits us to provide you with a smooth, efficient, and customised experience. Specifically, we may use information collected from you to:</p>
                <ul className="body-md mt-3 list-disc space-y-1 pl-6">
                  <li>Respond to your enquiries and appointment requests</li>
                  <li>Send you appointment confirmations and reminders</li>
                  <li>Provide dental care and treatment-related communications</li>
                  <li>Improve our website and services</li>
                  <li>Send administrative information such as updates to our terms and policies</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md mb-3">4. Disclosure of Your Information</h2>
                <p className="body-md">We may share your information with third parties only in the ways that are described in this privacy policy, including:</p>
                <ul className="body-md mt-3 list-disc space-y-1 pl-6">
                  <li><span className="font-medium text-zinc-900 dark:text-white">Service Providers:</span> We may share your information with third-party vendors who perform services on our behalf, such as appointment scheduling platforms (e.g., Practo), hosting providers, and analytics services.</li>
                  <li><span className="font-medium text-zinc-900 dark:text-white">Legal Requirements:</span> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                  <li><span className="font-medium text-zinc-900 dark:text-white">Business Transfers:</span> We may share or transfer your information in connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
                </ul>
              </div>
              <div>
                <h2 className="heading-md mb-3">5. Cookies and Tracking Technologies</h2>
                <p className="body-md">We may use cookies, beacons, tracking pixels, and other tracking technologies on the website to help customise the website and improve your experience. Cookies are small files placed on your device that enable us to collect certain information automatically.</p>
                <p className="body-md mt-3">You can choose to set your web browser to refuse cookies or to alert you when cookies are being sent. If you do so, note that some parts of this site may not function properly.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">6. Third-Party Websites</h2>
                <p className="body-md">The website may contain links to third-party websites and applications of interest, including Practo, social media platforms (Instagram, YouTube, Facebook), and Google Maps. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policy of every website you visit.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">7. Data Security</h2>
                <p className="body-md">We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security system is impenetrable and we cannot guarantee the security of our systems 100%.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">8. Data Retention</h2>
                <p className="body-md">We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. When we no longer need to process your personal information, we will securely delete or anonymise it.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">9. Your Rights</h2>
                <p className="body-md">Depending on your location, you may have certain rights regarding your personal information, including:</p>
                <ul className="body-md mt-3 list-disc space-y-1 pl-6">
                  <li>The right to access the personal information we hold about you</li>
                  <li>The right to request correction of inaccurate personal information</li>
                  <li>The right to request deletion of your personal information</li>
                  <li>The right to object to processing of your personal information</li>
                  <li>The right to withdraw consent at any time</li>
                </ul>
                <p className="body-md mt-3">To exercise any of these rights, please contact us using the information provided below.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">10. Children&apos;s Privacy</h2>
                <p className="body-md">Our website is not directed to children under the age of 18, and we do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">11. Changes to This Policy</h2>
                <p className="body-md">We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this privacy policy periodically for any changes.</p>
              </div>
              <div>
                <h2 className="heading-md mb-3">12. Contact Us</h2>
                <p className="body-md">If you have questions or concerns about this privacy policy, please contact us at:</p>
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
