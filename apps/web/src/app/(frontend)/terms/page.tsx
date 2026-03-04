import type { Metadata } from 'next'
import { AppNavbar } from '@/components/AppNavbar'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for payloadtwist — rules for using the platform.',
}

export default function TermsPage() {
  return (
    <div className="landing min-h-screen">
      <AppNavbar />
      <div id="main-content" className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 4, 2026</p>

        <div className="prose-custom space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance</h2>
            <p>
              By using payloadtwist, you agree to these terms. If you do not agree, please do not
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. The Service</h2>
            <p>
              payloadtwist is a visual CSS theme editor for the Payload CMS admin panel. It allows
              you to customize CSS variables and component styles, preview changes in real time, and
              export the result as a <code className="text-foreground">custom.scss</code> file for
              your Payload project.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>One person or entity may not maintain more than one account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. User Content</h2>
            <p>
              Theme presets you create belong to you. By making a preset public, you grant other
              users a non-exclusive license to view and use the preset as a starting point for their
              own themes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to the service or its systems.</li>
              <li>Interfere with other users&apos; use of the service.</li>
              <li>Upload malicious code or content through preset data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Open Source</h2>
            <p>
              payloadtwist is released under the MIT License. The source code is freely available.
              These terms govern use of the hosted service, not the source code itself (which is
              governed by its license).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Disclaimer of Warranties
            </h2>
            <p>
              The service is provided &quot;as is&quot; without warranty of any kind. We do not
              guarantee that the service will be available at all times or that generated CSS will be
              compatible with all Payload CMS versions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, payloadtwist and its maintainers shall not be
              liable for any indirect, incidental, or consequential damages arising from your use of
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the service at any time for violation of
              these terms. You may delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
