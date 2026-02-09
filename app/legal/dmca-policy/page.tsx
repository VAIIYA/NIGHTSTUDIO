"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function DMCAPolicy() {
    return (
        <LegalLayout title="DMCA Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. DMCA Notice</h2>
                <p>
                    NIGHTSTUDIO respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to notices of alleged infringement that are reported to our Designated Copyright Agent.
                </p>
            </section>

            <section>
                <h2>2. How to File a Takedown Notice</h2>
                <p>
                    If you are a copyright owner or an agent thereof and believe that any content hosted on NIGHTSTUDIO infringes your copyright, you may submit a notification pursuant to the DMCA by providing our Copyright Agent with the following information in writing:
                </p>
                <ul>
                    <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
                    <li>Identification of the copyrighted work claimed to have been infringed.</li>
                    <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to permit us to locate the material (e.g., URL or Post ID).</li>
                    <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email address.</li>
                    <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                    <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
                </ul>
            </section>

            <section>
                <h2>3. Designated Copyright Agent</h2>
                <div className="bg-meta-orange/5 p-6 rounded-2xl border border-meta-orange/10 my-8 text-sm">
                    <p className="font-bold text-meta-navy mb-1 uppercase tracking-tighter">NIGHTSTUDIO DMCA AGENT</p>
                    <p className="text-meta-navy/70 font-medium">
                        Email: dmca@bunnyranch.com<br />
                        Subject Line: DMCA Takedown Request
                    </p>
                </div>
            </section>

            <section>
                <h2>4. Counter-Notification</h2>
                <p>
                    If you believe that your content was removed by mistake or misidentification, you may submit a counter-notification to our Copyright Agent containing the information required by the DMCA.
                </p>
            </section>

            <section>
                <h2>5. Repeat Infringer Policy</h2>
                <p>
                    NIGHTSTUDIO maintains a policy to terminate, in appropriate circumstances, the accounts of users who are found to be repeat infringers.
                </p>
            </section>
        </LegalLayout>
    )
}
