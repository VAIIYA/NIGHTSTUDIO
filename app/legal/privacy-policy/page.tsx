"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Overview</h2>
                <p>
                    NIGHTSTUDIO ("we," "us," or "our") is a decentralized creator platform built on the Solana blockchain. We are committed to protecting your privacy and ensuring you have control over your data. This Privacy Policy explains how we collect, use, and safeguard your information.
                </p>
            </section>

            <section>
                <h2>2. Data Collection (Privacy-First)</h2>
                <p>
                    Unlike traditional platforms, NIGHTSTUDIO minimizes data collection. We do not require traditional KYC (Know Your Customer) documentation for standard usage.
                </p>
                <ul>
                    <li><strong>Wallet Information:</strong> We only store your Solana public key. We never have access to your private keys or seed phrases.</li>
                    <li><strong>On-Chain Data:</strong> All transactions are recorded on the Solana blockchain and are public by nature.</li>
                    <li><strong>Creator Content:</strong> Media uploaded by creators is stored decentrally via IPFS/Storacha.</li>
                </ul>
            </section>

            <section>
                <h2>3. No-KYC Strategy</h2>
                <p>
                    We pride ourselves on being a No-KYC platform. We do not collect government IDs, passports, or biometric data. Our age verification process is designed to be privacy-preserving and non-invasive.
                </p>
            </section>

            <section>
                <h2>4. Third-Party Services</h2>
                <p>
                    We may use third-party tools for analytics or content delivery. However, we ensure these partners adhere to strict privacy standards and pseudonymize user data whenever possible.
                </p>
            </section>

            <section>
                <h2>5. Your Rights</h2>
                <p>
                    As a user of a blockchain platform, many of your rights are self-enforced through the decentralization of your assets and identity. However, you can always request the removal of your off-chain profile data by contacting our support team.
                </p>
            </section>

            <section>
                <h2>6. Changes to this Policy</h2>
                <p>
                    We may update this policy from time to time. Significant changes will be announced via our social channels and on our official platform dashboard.
                </p>
            </section>
        </LegalLayout>
    )
}
