"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">DMCA Notice</h1>
          <p className="text-zinc-400">Digital Millennium Copyright Act Policy</p>
        </div>

        {/* DMCA Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">DMCA Overview</h2>
              <p className="text-zinc-300 leading-relaxed">
                NightStudio respects the intellectual property rights of others and expects its users to do the same.
                It is NightStudio&apos;s policy to respond to clear notices of alleged copyright infringement that comply
                with the Digital Millennium Copyright Act (&quot;DMCA&quot;). This page describes the information that should be
                present in a DMCA notice and how to submit it to us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Filing a DMCA Notice</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you believe that your work has been copied in a way that constitutes copyright infringement, or that
                your intellectual property rights have been otherwise violated, please provide our Designated Agent
                (listed below) with the following information in writing:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed;</li>
                <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works at that site;</li>
                <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material;</li>
                <li>Information reasonably sufficient to permit us to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted;</li>
                <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law;</li>
                <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Designated Agent Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed">
                Our Designated Agent to receive notification of claimed infringement under the DMCA can be reached by:
              </p>
              <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-6 mt-4">
                <p className="text-zinc-300"><strong>Email:</strong> dmca@nightstudio.com</p>
                <p className="text-zinc-300 mt-2"><strong>Address:</strong></p>
                <p className="text-zinc-300">NightStudio DMCA Agent<br/>
                [Your Company Address]<br/>
                [City, State, ZIP Code]<br/>
                [Country]</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Counter-Notification Process</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you believe that your content was removed or access to it was disabled by mistake or misidentification,
                you may file a counter-notification with our Designated Agent. To be effective, the counter-notification
                must be a written communication provided to our Designated Agent that includes substantially the following:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li>Your physical or electronic signature;</li>
                <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access to it was disabled;</li>
                <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled;</li>
                <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of Federal District Court for the judicial district in which your address is located, or if your address is outside of the United States, for any judicial district in which we may be found, and that you will accept service of process from the person who provided the original notification or an agent of such person.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Repeat Infringer Policy</h2>
              <p className="text-zinc-300 leading-relaxed">
                In accordance with the DMCA and other applicable laws, NightStudio has adopted a policy of terminating,
                in appropriate circumstances and at our sole discretion, users who are deemed to be repeat infringers.
                NightStudio may also, in its sole discretion, limit access to the service and/or terminate the accounts
                of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Important Notes</h2>
              <p className="text-zinc-300 leading-relaxed">
                Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that
                material or activity is infringing, or that material or activity was removed or disabled by mistake or
                misidentification, will be liable for any damages, including costs and attorneys&apos; fees, incurred by us
                or our users.
              </p>
              <p className="text-zinc-300 leading-relaxed mt-4">
                We may provide copies of such notices to the participants in the dispute or to third parties, at our
                discretion and as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you have any questions about this DMCA Policy, please contact us at dmca@nightstudio.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}