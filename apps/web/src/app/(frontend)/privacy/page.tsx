import type { Metadata } from 'next'
import { AppNavbar } from '@/components/AppNavbar'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for payloadtwist — how we handle your data.',
}

export default function PrivacyPage() {
  return (
    <div className="landing min-h-screen">
      <AppNavbar />
      <div id="main-content" className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 4, 2026</p>

        <div className="prose-custom space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Overview</h2>
            <p>
              payloadtwist is an open-source CSS theme editor for the Payload CMS admin panel. We
              respect your privacy and collect only the minimum data necessary to provide the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account information:</strong> When you register,
                we store your email address and a hashed password. We never store plaintext
                passwords.
              </li>
              <li>
                <strong className="text-foreground">Theme presets:</strong> Presets you save are
                stored in our database and associated with your account. Public presets are visible
                to other users.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> We may collect anonymous
                usage analytics (page views, feature usage) to improve the product. No personally
                identifiable information is included.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Data We Do Not Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not track you across other websites.</li>
              <li>We do not sell or share your data with third parties.</li>
              <li>We do not use your data for advertising purposes.</li>
              <li>
                The theme editor runs entirely in your browser. Your CSS customizations are not sent
                to our servers unless you explicitly save a preset.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Cookies</h2>
            <p>
              We use essential cookies for authentication (session management). No third-party
              tracking cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Data Storage</h2>
            <p>
              Your data is stored in a PostgreSQL database. We take reasonable measures to protect
              your data, including encrypted connections and hashed passwords.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Your Rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Delete your account and all associated data at any time.</li>
              <li>Export your presets via the generated CSS output.</li>
              <li>Request a copy of the data we hold about you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Open Source</h2>
            <p>
              payloadtwist is open source. You can inspect exactly what data we collect and how we
              handle it by reviewing the source code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Changes</h2>
            <p>
              We may update this policy from time to time. Significant changes will be communicated
              through the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
