"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContractPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contract Between Fan and Creator</h1>
              <p className="text-[#121212]/50">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Contract Content */}
            <div className="prose max-w-none">
          <div className="space-y-8">
            <section>
              <p className="text-[#121212]/70 leading-relaxed">
                <strong>Introduction:</strong> This Contract between Fan and Creator (&ldquo;this Agreement&rdquo;) governs each interaction between a Fan and a Creator on NightStudio.
              </p>
            </section>

            <section>
              <p className="text-[#121212]/70 leading-relaxed">
                <strong>Scope:</strong> This Agreement is legally binding and applies each time a Creator Interaction is initiated on NightStudio. This Agreement applies to the exclusion of any other terms which the Fan or Creator may propose.
              </p>
            </section>

            <section>
              <p className="text-[#121212]/70 leading-relaxed">
                <strong>Parties:</strong> The only parties to this Agreement are the Fan and Creator participating in the Creator Interaction. NightStudio and/or its affiliates are not parties to this Agreement or any Creator Interaction except as set forth below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Interpretation</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                In this Agreement, defined terms have the following meanings:
              </p>
              <ol className="list-decimal list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>&ldquo;<strong>Content</strong>&rdquo;: any material uploaded to NightStudio by any User, including any photos, videos, audio, livestream material, data, text, metadata, images, interactive features, emojis, GIFs, memes, and any other material whatsoever</li>
                <li>&ldquo;<strong>Creator</strong>&rdquo;: a User who has set up their NightStudio account to post Content for Fans to view</li>
                <li>&ldquo;<strong>Creator Earnings</strong>&rdquo;: the portion of a Fan Payment payable to a Creator pursuant to the Terms of Service</li>
                <li>&ldquo;<strong>Creator Interaction</strong>&rdquo;: an interaction on NightStudio that grants access to a Creator&apos;s Content, including: (i) a Subscription; (ii) a payment for pay-per-view Content; and (iii) any other interaction or payment between a User and a Creator&apos;s account or Content, including direct messages</li>
                <li>&ldquo;<strong>Creator Interaction Licence</strong>&rdquo;: the non-transferable, non-sublicensable, and non-exclusive rights each Creator grants to Relevant Content</li>
                <li>&ldquo;<strong>Fan</strong>&rdquo;: a User who has registered for an account and who can access Creators&apos; Content via a Creator Interaction</li>
                <li>&ldquo;<strong>Fan Payment</strong>&rdquo;: any payment related to a Creator Interaction</li>
                <li>&ldquo;<strong>Fee</strong>&rdquo;: the platform fee deducted from Fan Payments in accordance with the Terms of Service</li>
                <li>&ldquo;<strong>Include</strong>&rdquo;, &ldquo;<strong>Includes</strong>&rdquo; and &ldquo;<strong>Including</strong>&rdquo; also mean &ldquo;<strong>without limitation</strong>&rdquo;</li>
                <li>&ldquo;<strong>Indirect Sales Taxes</strong>&rdquo;: any tax that is statutorily applied to Fan Payments in any relevant jurisdiction</li>
                <li>&ldquo;<strong>NightStudio</strong>&rdquo;: the platform accessed via the NightStudio website or application</li>
                <li>&ldquo;<strong>Paid Relevant Content</strong>&rdquo;: any Content for which the Fan must make a Fan Payment</li>
                <li>&ldquo;<strong>Referring User</strong>&rdquo;: a User who participates in the NightStudio Referral Program</li>
                <li>&ldquo;<strong>Relevant Content</strong>&rdquo;: the applicable Content of a Creator to which a Creator Interaction relates</li>
                <li>&ldquo;<strong>Subscription</strong>&rdquo;: a Fan&apos;s binding agreement to obtain access for a specific period of time to all Content that a Creator makes available to Fans in exchange for authorising automatic renewal payments. This excludes individually priced Content.</li>
                <li>&ldquo;<strong>Tax</strong>&rdquo;: all forms of tax and statutory or governmental charges, duties, imposts, contributions, levies, withholdings, or liabilities wherever chargeable in any applicable jurisdiction</li>
                <li>&ldquo;<strong>Upload</strong>&rdquo;: publish, display, post, type, input, or otherwise share any photos, videos, audio, livestream material, data, text, metadata, images, interactive features, emojis, GIFs, memes, and any other material whatsoever</li>
                <li>&ldquo;<strong>User</strong>&rdquo;: any user of NightStudio, whether a Creator or a Fan or both (also referred to as &ldquo;<strong>you</strong>&rdquo; or &ldquo;<strong>your</strong>&rdquo;)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Pricing and Payment</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                The Fan entering into a Creator Interaction agrees to pay the applicable Fan Payment plus any Indirect Sales Tax, which NightStudio and its affiliates are authorised to collect. NightStudio is also authorised to deduct the platform fee, to pay out Creator Earnings, and to pay applicable referral payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Subscriptions and Renewals</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                When you select &ldquo;Subscribe,&rdquo; you agree to start a Subscription. A Subscription will automatically renew at the current rate (plus Indirect Sales Tax). You authorise NightStudio to charge you again after each Subscription, unless: (i) your payment is declined and you have not provided another payment; (ii) the Subscription price has increased; (iii) you switched off the &ldquo;Auto-Renew&rdquo; feature on the Creator&apos;s account; or (iv) you close your NightStudio account before the new Subscription period begins.
              </p>
              <p className="text-[#121212]/70 leading-relaxed mt-4">
                <strong>By selecting &ldquo;Subscribe,&rdquo; you agree to these provisions, and acknowledge that you will not receive further notice regarding the renewal of that Subscription.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Licence of Content</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                As part of a Creator Interaction, the Creator grants a Creator Interaction Licence. The Creator Interaction Licence permits a Fan access to Relevant Content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Ownership of Content</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                The Creator Interaction Licence does not grant any Fan ownership rights to the Relevant Content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Expiry of Licence</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                The Creator Interaction Licence expires automatically without notice:
              </p>
              <ol className="list-decimal list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>if the Fan Payment related to the Creator Interaction was unsuccessful, charged back, or reversed;</li>
                <li>if the Creator deletes either the Relevant Content or their Creator account;</li>
                <li>when an active Subscription period ends;</li>
                <li>if the Fan&apos;s account is suspended or terminated;</li>
                <li>if the Fan breaches the NightStudio Terms of Service;</li>
                <li>if Relevant Content is removed from the Creator&apos;s account or the Creator&apos;s account is suspended or terminated; and</li>
                <li>if the Fan closes their account.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Removal of Content</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                NightStudio reserves the right to remove any Content from a Creator&apos;s account at any time. The Fan participating in the Creator Interaction acknowledges that Creators may remove Content, including pay-per-view Content at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Cancellation and Refunds</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                In respect of every Creator Interaction:
              </p>
              <ol className="list-decimal list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>The Fan will gain access to the Relevant Content within 14 days of the Creator Interaction. The Fan agrees that any statutory right to cancel the Creator Interaction under applicable consumer protection laws is therefore not applicable regarding any Creator Interaction other than a Subscription.</li>
                <li>This Agreement does not affect any statutory right to a refund which a Fan may have under applicable consumer protection laws.</li>
                <li>Cancellations and refunds also are subject to NightStudio&apos;s Terms of Service.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Obligations Between Creator and Fan in Creator Interactions</h2>
              <ol className="list-decimal list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>The Fan and the Creator agree to comply at all times with NightStudio Terms of Service.</li>
                <li>The Creator is solely responsible for creating and publishing Relevant Content.</li>
                <li>The Creator warrants that it possesses all necessary rights to grant a Creator Interaction Licence.</li>
                <li>The Creator agrees to provide Paid Relevant Content once the Fan has made the Fan Payment.</li>
                <li>The Fan acknowledges that third parties may assist Creators in operating their accounts and in Creator Interactions.</li>
                <li>The Fan agrees to make the Fan Payment required to access Paid Relevant Content.</li>
                <li>The Fan agrees not to initiate a chargeback unless the Fan disputes the Creator Interaction in good faith.</li>
                <li>The Fan assumes all risk of accessing the Relevant Content unless the Creator engages in negligence or another breach of duty.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">No Guarantees</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                The Fan participating in the Creator Interaction acknowledges that circumstances may prevent access to Relevant Content, including if the availability of all or any part of NightStudio is suspended or inaccessible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Applicable Law and Forum for Disputes</h2>
              <ol className="list-decimal list-inside text-[#121212]/70 space-y-2 mt-4">
                <li>To the greatest extent permitted by the laws of the place where you live, this Agreement is governed by the laws of [Your Jurisdiction], which will apply to any claim that arises out of or relates to this Agreement. The Fan will also be able to rely on mandatory rules of the law of the country where they live.</li>
                <li>Where claims can be brought: Any Fan may bring a claim under this Agreement in the courts of [Your Jurisdiction] or the country where the Fan lives.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Severability</h2>
              <p className="text-[#121212]/70 leading-relaxed">
                In the event any provision of this Agreement is found by a court of competent jurisdiction to be invalid or unenforceable, or is prohibited by law, the remaining provisions of the Agreement shall remain in full force and effect, and the remainder of this Agreement shall be valid and binding as though such invalid, unenforceable, or prohibited provision were not included herein.
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