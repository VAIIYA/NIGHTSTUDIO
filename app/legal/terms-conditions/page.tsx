"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function TermsConditions() {
    return (
        <LegalLayout title="Terms & Conditions" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the NIGHTSTUDIO platform, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you must not use our services.
                </p>
            </section>

            <section>
                <h2>2. Age Requirement</h2>
                <p>
                    NIGHTSTUDIO is intended for adults only. You must be at least 18 years of age (or the age of majority in your jurisdiction) to use this platform. Use of the platform by minors is strictly prohibited and will result in permanent account termination.
                </p>
            </section>

            <section>
                <h2>3. Solana Wallet & Transactions</h2>
                <p>
                    NIGHTSTUDIO operates on the Solana blockchain.
                </p>
                <ul>
                    <li><strong>Self-Custody:</strong> You are solely responsible for the security of your Solana wallet and private keys.</li>
                    <li><strong>Fees:</strong> All transactions are subject to network (gas) fees on the Solana network. NIGHTSTUDIO takes a 10% platform fee on creator earnings.</li>
                    <li><strong>Finality:</strong> Blockchain transactions are irreversible. We cannot refund payments once they have been processed on-chain.</li>
                </ul>
            </section>

            <section>
                <h2>4. Creator Responsibilities</h2>
                <p>
                    Creators are responsible for the content they publish. Content must adhere to our Acceptable Use Policy and Community Guidelines.
                </p>
            </section>

            <section>
                <h2>5. Content Ownership & Licensing</h2>
                <p>
                    Creators retain ownership of their content. By posting content, creators grant fans a personal, non-exclusive, non-transferable license to view that content on the NIGHTSTUDIO platform. Commercial redistribution of content is strictly prohibited.
                </p>
            </section>

            <section>
                <h2>6. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate accounts that violate our terms or engage in illegal activities, without prior notice.
                </p>
            </section>
        </LegalLayout>
    )
}
