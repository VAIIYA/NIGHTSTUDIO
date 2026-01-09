"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-zinc-300 leading-relaxed">
                These Terms of Use govern your use of NightStudio and your agreement with us. Here are a few key things to note:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li><strong>We can modify these Terms of Service at any time.</strong></li>
                <li><strong>If you purchase a Subscription, it will automatically renew for additional periods of the same duration unless you cancel it.</strong></li>
                <li><strong>Your rights may vary depending on where you are resident when you access NightStudio.</strong></li>
                <li><strong>If a dispute arises between you and us, you agree to notify us and agree to mediation before bringing any claim against us.</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Interpretation</h2>
              <p className="text-zinc-300 leading-relaxed">
                In the Terms of Service:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li>We refer to our website as &ldquo;<strong>NightStudio</strong>&rdquo;, including when accessed via any URL;</li>
                <li>&ldquo;<strong>We</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo; are references to the operator of NightStudio;</li>
                <li>&ldquo;<strong>Business User</strong>&rdquo;: a User who uses NightStudio for commercial reasons;</li>
                <li>&ldquo;<strong>Consumer</strong>&rdquo;: all Users who are not Business Users;</li>
                <li>&ldquo;<strong>Content</strong>&rdquo;: any material Uploaded to NightStudio by any User, including photos, videos, audio, text, and other material;</li>
                <li>&ldquo;<strong>Creator</strong>&rdquo;: a User who has set up their NightStudio account to post Content for Fans to view;</li>
                <li>&ldquo;<strong>Fan</strong>&rdquo;: a User who has registered for an account and who can access Creators&apos; Content;</li>
                <li>&ldquo;<strong>Subscription</strong>&rdquo;: a Fan&apos;s binding agreement to obtain access for a specific period of time to all content that a Creator makes available;</li>
                <li>&ldquo;<strong>Upload</strong>&rdquo;: publish, display, post, or otherwise share any material;</li>
                <li>&ldquo;<strong>User</strong>&rdquo;: any user of NightStudio, whether a Creator or a Fan;</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Who we are and how to contact us</h2>
              <p className="text-zinc-300 leading-relaxed">
                NightStudio is operated by [Your Company Name]. To contact us with questions, please use our contact form or email us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. We may change the Terms of Service</h2>
              <p className="text-zinc-300 leading-relaxed">
                Where permitted we may change any part of the Terms of Service without Notice to reflect changes in applicable laws and regulations, or to address a risk to NightStudio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Registering with NightStudio</h2>
              <p className="text-zinc-300 leading-relaxed">
                By registering with and using NightStudio, you agree to the Terms of Service. To use NightStudio you must register and open an account. You must provide a valid email address and authenticate using a wallet.
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li>You must be at least 18 years old;</li>
                <li>You must be able to be legally bound by a contract with us;</li>
                <li>You agree to pay for Creator Interactions in accordance with the Terms of Service;</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Adult material</h2>
              <p className="text-zinc-300 leading-relaxed">
                Some Content on NightStudio contains adult material, and you acknowledge and agree to this when you access NightStudio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Content – general terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                Your Content is not confidential, and you authorise your Fans to access and view your Content on NightStudio for their own lawful and personal use.
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4">
                <li>You are legally responsible for all Content you Upload;</li>
                <li>You warrant that your Content complies with the Terms of Service and all applicable laws;</li>
                <li>We are not responsible for Content that Users post;</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Fan subscriptions and purchases</h2>
              <p className="text-zinc-300 leading-relaxed">
                Fan Payments are processed in SOL or USDC on Solana. When you select &ldquo;Subscribe,&rdquo; you agree to start a Subscription that will automatically renew unless you cancel it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Creator payouts</h2>
              <p className="text-zinc-300 leading-relaxed">
                Creator Earnings will be paid out in SOL or USDC to your connected wallet. We deduct a fee from each Fan Payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Our rights and obligations</h2>
              <p className="text-zinc-300 leading-relaxed">
                We reserve the right to suspend or remove Content that may breach our Terms of Service. We may suspend or delete accounts according to our Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Intellectual property rights</h2>
              <p className="text-zinc-300 leading-relaxed">
                You confirm that your Content does not infringe intellectual property rights. You grant us a license to use your Content for operating NightStudio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Account deletion</h2>
              <p className="text-zinc-300 leading-relaxed">
                You may delete your NightStudio account at any time. After deletion, you will not have access to your account or Content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Responsibility for alleged loss or damage</h2>
              <p className="text-zinc-300 leading-relaxed">
                We will use reasonable care and skill in providing NightStudio, but there are things we are not responsible for, including loss of profit, business interruption, or indirect losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Choice of law and forum for disputes</h2>
              <p className="text-zinc-300 leading-relaxed">
                Your agreement with us is governed by the laws of [Jurisdiction]. The courts of [Jurisdiction] will have jurisdiction over any disputes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}