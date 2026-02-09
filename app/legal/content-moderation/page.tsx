"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function ContentModeration() {
    return (
        <LegalLayout title="Content Moderation" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Our Philosophy</h2>
                <p>
                    NIGHTSTUDIO is a platform for free expression, but we must balance this with our legal obligations and community safety. We employ a rigorous moderation strategy to identify and remove illegal content and violations of our Acceptable Use Policy.
                </p>
            </section>

            <section>
                <h2>2. Hybrid Moderation Model</h2>
                <p>
                    We use a combination of technologies and human expertise to moderate content:
                </p>
                <ul>
                    <li><strong>Automated Screening:</strong> Every image uploaded to the platform is automatically scanned by AI for Child Sexual Abuse Material (CSAM), non-consensual imagery, and extreme violence.</li>
                    <li><strong>Manual Human Review:</strong> Our moderation team reviews every report submitted by the community and performs random audits of new creator profiles to ensure compliance.</li>
                </ul>
            </section>

            <section>
                <h2>3. Proactive vs. Reactive Moderation</h2>
                <p>
                    We are proactive in identifying the most severe violations (illegal content) and reactive in handling nuanced community violations through our reporting system.
                </p>
            </section>

            <section>
                <h2>4. Appeals Process</h2>
                <p>
                    If your content has been removed or your account suspended, and you believe it was an error, you may submit an appeal to our moderation leadership at appeals@bunnyranch.com.
                </p>
            </section>

            <section>
                <h2>5. Transparency</h2>
                <p>
                    We are committed to transparency in our moderation decisions. While we cannot disclose specific details of automated screening algorithms, we aim to provide clear reasoning for any manual enforcement actions.
                </p>
            </section>
        </LegalLayout>
    )
}
