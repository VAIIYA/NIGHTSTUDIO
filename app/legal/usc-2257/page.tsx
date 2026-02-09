"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function USC2257() {
    return (
        <LegalLayout title="USC 2257 Disclosure" lastUpdated="January 22, 2026">
            <section>
                <h2>Compliance Statement</h2>
                <p>
                    NIGHTSTUDIO, as the owner and operator of the NIGHTSTUDIO platform, voluntarily complies with the requirements of 18 U.S.C. § 2257 and its implementing regulations (the "Records Keeping Act").
                </p>
            </section>

            <section>
                <h2>Record Keeping</h2>
                <p>
                    As required by 18 U.S.C. § 2257, records for all depictions of sexually explicit conduct appearing on this platform are maintained by our designated Records Custodian.
                </p>
                <p>
                    While NIGHTSTUDIO is a decentralized platform, we ensure that for all material hosted or facilitated by our services, appropriate age affirmation and record-keeping procedures have been followed at the point of creator onboarding.
                </p>
            </section>

            <section>
                <h2>Custodian of Records</h2>
                <p>
                    Official records required by law are kept at our primary administrative repository.
                </p>
                <div className="bg-meta-peach/50 p-6 rounded-2xl border border-meta-navy/5 my-8">
                    <p className="font-bold text-meta-navy mb-1 uppercase tracking-tighter">Records Custodian</p>
                    <p className="text-meta-navy/70 font-medium">
                        NIGHTSTUDIO Legal Department<br />
                        Attn: Records Custodian<br />
                        Email: legal@bunnyranch.com
                    </p>
                </div>
            </section>

            <section>
                <h2>Exemptions</h2>
                <p>
                    Some content on this platform may be exempt from the requirements of 18 U.S.C. § 2257 if it does not contain depictions of sexually explicit conduct as defined by the statute.
                </p>
            </section>
        </LegalLayout>
    )
}
