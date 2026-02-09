"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function StandardContract() {
    return (
        <LegalLayout title="Standard Contract" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Scope of Agreement</h2>
                <p>
                    This Standard Contract (the "Agreement") governs the relationship between a Fan (the user who pays to unlock content) and a Creator (the user who publishes the content) on the NIGHTSTUDIO platform.
                </p>
            </section>

            <section>
                <h2>2. Content Licensing</h2>
                <p>
                    When a Fan successfully unlocks a post using USDC, the Creator grants the Fan a limited, personal, non-exclusive, non-transferable license to access and view the digital content for their own personal, non-commercial use.
                </p>
            </section>

            <section>
                <h2>3. Prohibited Uses</h2>
                <p>
                    The Fan agrees NOT to:
                </p>
                <ul>
                    <li>Download, screen-record, or copy the content.</li>
                    <li>Redistribute, sell, or publicly display the content on any other platform.</li>
                    <li>Use the content for any commercial purpose.</li>
                    <li>Remove any watermarks or identification markers from the content.</li>
                </ul>
            </section>

            <section>
                <h2>4. Payments & Revenue</h2>
                <p>
                    All payments are processed via the Solana blockchain. Once a transaction is confirmed on-chain, the Fan's access is granted. Creators receive 90% of the transaction amount, and the NIGHTSTUDIO platform receives 10%.
                </p>
            </section>

            <section>
                <h2>5. Disclaimer</h2>
                <p>
                    The platform operates as a facilitator and is not a party to this agreement except where noted. Creators are independent contractors and not employees of NIGHTSTUDIO.
                </p>
            </section>
        </LegalLayout>
    )
}
