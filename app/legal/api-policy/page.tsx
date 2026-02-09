"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function APIPolicy() {
    return (
        <LegalLayout title="API Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Developer Access</h2>
                <p>
                    NIGHTSTUDIO provides limited API access for developers building tools that enhance the creator experience on Solana. Access is granted on a case-by-case basis.
                </p>
            </section>

            <section>
                <h2>2. Permitted Use</h2>
                <p>
                    Developers may use our API to build analytics dashboards, scheduling tools, and wallet management integrations.
                </p>
            </section>

            <section>
                <h2>3. Prohibited Use</h2>
                <p>
                    The API must NOT be used for:
                </p>
                <ul>
                    <li>Scraping or harvesting creator media.</li>
                    <li>Building clones or competing third-party interfaces without explicit permission.</li>
                    <li>Engaging in deceptive or fraudulent activities.</li>
                    <li>Violating any part of our Terms & Conditions or AUP.</li>
                </ul>
            </section>

            <section>
                <h2>4. Rate Limiting</h2>
                <p>
                    We enforce strict rate limits to maintain platform stability. Excessive requests that hamper platform performance will result in API access being revoked.
                </p>
            </section>

            <section>
                <h2>5. Termination</h2>
                <p>
                    NIGHTSTUDIO reserves the right to terminate API access at any time, for any reason, with or without notice.
                </p>
            </section>
        </LegalLayout>
    )
}
