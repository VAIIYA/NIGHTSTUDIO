"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-peach-gradient text-[#121212] overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#121212]/70">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="/creators" className="hover:text-primary transition-colors">Creators</a>
          <a href="/about" className="hover:text-primary transition-colors">About</a>
        </div>
        <div className="hidden md:block">
          <Button variant="outline" className="rounded-full border-[#121212]/10 hover:bg-primary/5 text-sm font-bold">
            Learn More
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#121212]/50 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-[#121212]/50">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Privacy Content */}
            <div className="prose max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                NightStudio (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy and we are committed to protecting the Personal Data we process about you. We are the owner and operator of NightStudio, a next-generation social platform built on Solana that enables Creators to share exclusive content and connect with their Fans.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                This privacy policy (&ldquo;Policy&rdquo;) explains our practices with respect to the Personal Data processed about our Creators and Fans. It also explains our practices with respect to the Personal Data processed about individuals that feature in content uploaded by a Creator (&ldquo;Content Collaborators&rdquo;), and where we process Personal Data in the context of our business relationships.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                We process your Personal Data when you use NightStudio and for the provision of the services that we offer from time to time via NightStudio (the &ldquo;Services&rdquo;). We are a &ldquo;data controller&rdquo; of the Personal Data that we process in connection with the Services. This means that we decide the reasons why we process Personal Data about you and how we do so.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">What is Personal Data?</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                &ldquo;Personal Data&rdquo; means information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular person or household.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                In addition, we may collect data that is not capable of identifying you or is otherwise not associated or linked with you, such as deidentified, aggregated or anonymised information. This type of data is not Personal Data and our use of such data is not subject to this Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Informing us of changes</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                It is important that the Personal Data we hold about you is accurate and current. Please keep us informed if your Personal Data changes at any point during your relationship with us. Updates or corrections can be made through your account settings on NightStudio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Applicability of this Policy (18+)</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                This Policy is provided in addition to, but does not form part of, our Terms of Service that govern your use of NightStudio and the Services.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                <strong>Our Services are strictly intended for individuals 18 years of age or older. Anyone under 18 years of age is not permitted to use the Services. By using the Services, you represent that you are 18 years of age or older.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Third-party links</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                NightStudio may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share Personal Data about you.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                We are not responsible for, and this Policy does not apply to, the content, security or privacy practices of those other websites, plug-ins or applications. We encourage you to view the privacy and cookie policies / notices of those third parties to find out how your Personal Data may be used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">If you do not wish to provide Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We need to collect certain Personal Data from you to provide you with access to the Services, or specific features and functionalities of the Services, in accordance with our contract with you (i.e. our Terms of Service). We are also required to process certain Personal Data in accordance with applicable laws. Please note that if you do not wish to provide Personal Data where requested, we may not be able to provide you with access to the Services or specific features and functionalities of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Updates to this Policy</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We may update this Policy from time to time, and any updates will be effective upon our posting of the revised Policy on NightStudio. We will use reasonable efforts to notify you in the event that material updates are made to this Policy, such as sending you a feed notification or a chat message via your account on NightStudio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Categories of Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We process, or our third-party providers process on our behalf, different kinds of Personal Data about Creators, Content Collaborators and Fans, which we have grouped together as follows:
              </p>

              <div className="space-y-4 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">User Data</h3>
                  <p className="text-[#121212]/70"><strong>Creators and Content Collaborators:</strong></p>
                  <ul className="list-disc list-inside text-[#121212]/70 space-y-1 mt-2">
                    <li>full name</li>
                    <li>alias, if applicable</li>
                    <li>residential address</li>
                    <li>email address</li>
                    <li>telephone number</li>
                    <li>government identity document (where required)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[#121212]/70 mt-4"><strong>Fans:</strong></p>
                  <ul className="list-disc list-inside text-[#121212]/70 space-y-1 mt-2">
                    <li>email address</li>
                    <li>telephone number</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Account Data</h3>
                  <p className="text-[#121212]/70">Profile information, posts, comments, chat messages, and customer support queries.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Financial Data</h3>
                  <p className="text-[#121212]/70">Payment card details (tokenized), billing address, wallet information, and transaction data.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Technical Data</h3>
                  <p className="text-[#121212]/70">IP address, user agent, and other network activity information.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Usage Data</h3>
                  <p className="text-[#121212]/70">Information collected through cookies and similar technologies.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How / why your Personal Data is used</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We process Personal Data for the following purposes:
              </p>
              <ul className="list-disc list-inside text-[#121212]/70 space-y-2 mt-4">
                <li><strong>Performance of a contract:</strong> To provide the Services, process transactions, and fulfill our obligations under the Terms of Service.</li>
                <li><strong>Legitimate interests:</strong> To maintain platform security, prevent fraud, improve services, and communicate with you about your account.</li>
                <li><strong>Compliance with legal obligations:</strong> To comply with applicable laws and regulations.</li>
                <li><strong>Consent:</strong> Where required for specific processing activities, such as certain marketing communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Obtaining your Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We collect Personal Data directly from you when you register and use our Services, automatically through your use of the platform, and from third-party service providers where necessary for verification and payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Sharing your Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We share Personal Data with third-party service providers for payment processing, content moderation, identity verification, and other business purposes. We may also share Personal Data when required by law or to protect our rights and the safety of our users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Your rights regarding Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                Subject to applicable law, you have the right to:
              </p>
              <ul className="list-disc list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>Access your Personal Data</li>
                <li>Correct inaccurate Personal Data</li>
                <li>Delete your Personal Data</li>
                <li>Restrict processing of your Personal Data</li>
                <li>Data portability</li>
                <li>Object to processing based on legitimate interests</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Choices and control over your Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                You can update your account information through your profile settings. You may also opt out of certain communications and control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Retention of Personal Data</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                We retain Personal Data only as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Assistance and contact information</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                If you have questions about this Policy or our processing of your Personal Data, please contact us at privacy@nightstudio.com.
              </p>
            </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/5 py-12 relative z-10">
        <div className="container mx-auto px-6 text-center text-[#121212]/40 text-xs font-semibold">
          <p>&copy; {new Date().getFullYear()} NightStudio. Built on Solana.</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
            <Link href="/contract" className="hover:text-primary transition-colors">Creator Contract</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}