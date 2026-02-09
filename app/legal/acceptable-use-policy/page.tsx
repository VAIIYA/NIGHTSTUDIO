"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function AcceptableUsePolicy() {
    return (
        <LegalLayout title="Acceptable Use Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. Purpose</h2>
                <p>
                    This Acceptable Use Policy (AUP) outlines what behavior and content are prohibited on NIGHTSTUDIO. We aim to maintain a safe, legal, and respectful environment for all creators and fans.
                </p>
            </section>

            <section>
                <h2>2. Strictly Prohibited Content</h2>
                <p>
                    We maintain a zero-tolerance policy for the following types of content. Violation will result in immediate and permanent account termination, along with reports to appropriate authorities where necessary:
                </p>
                <ul>
                    <li><strong>Child Sexual Abuse Material (CSAM):</strong> Any content featuring or depicting minors in a sexual context.</li>
                    <li><strong>Non-Consensual Content:</strong> Any media published without the explicit consent of all participants.</li>
                    <li><strong>Extreme Violence & Harm:</strong> Content depicting real-life violence, gore, or self-harm.</li>
                    <li><strong>Illegal Activities:</strong> Promotion of illegal drugs, weapons trafficking, or financial fraud.</li>
                </ul>
            </section>

            <section>
                <h2>3. Social & Community Conduct</h2>
                <p>
                    Users must not engage in harassment, bullying, or hate speech. We do not tolerate discrimination based on race, religion, gender, or sexual orientation.
                </p>
            </section>

            <section>
                <h2>4. Content Moderation</h2>
                <p>
                    NIGHTSTUDIO utilizes a hybrid moderation system. We use automated AI tools to scan for prohibited material (such as CSAM) and employ a team of human moderators to review reports and ensure compliance with our guidelines.
                </p>
            </section>

            <section>
                <h2>5. Reporting Violations</h2>
                <p>
                    If you encounter content that violates this AUP, please use the "Report" button on the post or contact our moderation team at safety@bunnyranch.com.
                </p>
            </section>
        </LegalLayout>
    )
}
