"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function ComplaintsPolicy() {
    return (
        <LegalLayout title="Complaints Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Our Commitment</h2>
                <p>
                    NIGHTSTUDIO takes all complaints seriously. Whether it's about content, payments, or platform behavior, we are committed to providing a fair and efficient resolution process.
                </p>
            </section>

            <section>
                <h2>2. How to File a Complaint</h2>
                <p>
                    To submit a formal complaint, please email us with the following details:
                </p>
                <ul>
                    <li>Your wallet address.</li>
                    <li>A clear description of the issue.</li>
                    <li>Supporting evidence (e.g., transaction IDs, screenshots).</li>
                    <li>What you believe would be a fair resolution.</li>
                </ul>
                <p className="font-bold">Email: complaints@bunnyranch.com</p>
            </section>

            <section>
                <h2>3. Resolution Timeline</h2>
                <p>
                    We aim to acknowledge all complaints within 48 hours and provide a formal resolution within 7 to 10 business days, depending on the complexity of the investigation.
                </p>
            </section>

            <section>
                <h2>4. Escalation</h2>
                <p>
                    If you are not satisfied with the initial resolution, you may request an escalation to our senior compliance team.
                </p>
            </section>
        </LegalLayout>
    )
}
