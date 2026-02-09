"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'
import { Shield, Fingerprint, Lock, ShieldCheck } from 'lucide-react'

export default function AgeVerification() {
    return (
        <LegalLayout title="Age Verification" lastUpdated="January 22, 2026">
            <section className="mb-12">
                <p className="text-xl font-bold text-meta-navy">
                    NIGHTSTUDIO is a privacy-first platform. We believe that adult creators and fans should be able to interact securely without giving up their identity to centralized corporations.
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-meta-orange/5 p-6 rounded-[2rem] border border-meta-orange/10">
                    <div className="w-12 h-12 bg-meta-orange rounded-2xl flex items-center justify-center text-white mb-4">
                        <ShieldCheck size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-black text-meta-navy uppercase mb-2">Our USP: No KYC</h3>
                    <p className="text-sm text-meta-navy/70 leading-relaxed">
                        Unlike our competitors, we do not require you to upload your passport, driver's license, or biometric video selfies. We do not store your government-issued identity documents.
                    </p>
                </div>

                <div className="bg-meta-navy/5 p-6 rounded-[2rem] border border-meta-navy/10">
                    <div className="w-12 h-12 bg-meta-navy rounded-2xl flex items-center justify-center text-white mb-4">
                        <Fingerprint size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-black text-meta-navy uppercase mb-2">Privacy-Preserving</h3>
                    <p className="text-sm text-meta-navy/70 leading-relaxed">
                        We use decentralized or zero-knowledge-proof (ZKP) verification methods where possible to confirm you are an adult without knowing exactly who you are.
                    </p>
                </div>
            </section>

            <section>
                <h2>1. Why Verify?</h2>
                <p>
                    As a platform hosting adult content, we have a legal and ethical obligation to ensure that all users—both creators and fans—are at least 18 years of age. This prevents minors from accessing sensitive material and protects our community.
                </p>
            </section>

            <section>
                <h2>2. Creator Requirements</h2>
                <p>
                    While we don't do traditional KYC, creators must still complete a "Safety Onboarding." This involves:
                </p>
                <ul>
                    <li><strong>Wallet Signature:</strong> Verifying ownership of a Solana wallet.</li>
                    <li><strong>Age Affirmation:</strong> A legally binding electronic signature confirming adulthood.</li>
                    <li><strong>Third-Party Attestation:</strong> In some jurisdictions, we may use localized high-privacy age affirmation services that do not share your full ID with us.</li>
                </ul>
            </section>

            <section>
                <h2>3. Fan Requirements</h2>
                <p>
                    Fans must verify their age before they can view or unlock premium content. This is typically done through non-invasive credits or age-gated payment methods that confirm 18+ status at the gateway level.
                </p>
            </section>

            <section>
                <h2>4. Data Minimization</h2>
                <p>
                    NIGHTSTUDIO adheres to strict data minimization principles. We only store the "Verification Success" status against your wallet address, never the source data used to achieve it.
                </p>
            </section>
        </LegalLayout>
    )
}
