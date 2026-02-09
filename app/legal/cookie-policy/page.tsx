"use client"

import React from 'react'
import LegalLayout from '../../../components/LegalLayout'

export default function CookiePolicy() {
    return (
        <LegalLayout title="Cookie Policy" lastUpdated="January 22, 2026">
            <section>
                <h2>1. What are Cookies?</h2>
                <p>
                    Cookies are small text files that are placed on your device by websites that you visit. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                </p>
            </section>

            <section>
                <h2>2. Our Use of Cookies</h2>
                <p>
                    NIGHTSTUDIO uses minimal cookies to ensure platform functionality and security. We do not use cookies for invasive cross-site tracking or behavioral advertising.
                </p>
                <ul>
                    <li><strong>Essential Cookies:</strong> These are necessary for the platform to function, such as managing your session and security related to your wallet connection.</li>
                    <li><strong>Functional Cookies:</strong> These allow us to remember your preferences (such as theme choice) and localized settings.</li>
                </ul>
            </section>

            <section>
                <h2>3. Third-Party Cookies</h2>
                <p>
                    We may use localized analytics or content delivery partners that use cookies. We ensure these partners adhere to high privacy standards and we do not share your wallet address or profile info with them.
                </p>
            </section>

            <section>
                <h2>4. Managing Cookies</h2>
                <p>
                    Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.
                </p>
            </section>

            <section>
                <h2>5. Changes to this Policy</h2>
                <p>
                    We may update this Cookie Policy from time to time. The latest version will always be available on this page.
                </p>
            </section>
        </LegalLayout>
    )
}
