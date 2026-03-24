'use client'

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', color: '#e0ddd5', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .legal-container { max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
        .legal-logo { display: block; height: 36px; margin: 0 auto 2rem; }
        .legal-back { display: inline-flex; align-items: center; gap: 6px; color: #d4a537; text-decoration: none; font-size: 0.82rem; font-weight: 500; margin-bottom: 2rem; }
        .legal-back:hover { text-decoration: underline; }
        .legal-title { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
        .legal-updated { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-bottom: 2.5rem; }
        .legal-h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: #d4a537; margin: 2rem 0 0.75rem; }
        .legal-h3 { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); margin: 1.25rem 0 0.5rem; }
        .legal-p { font-size: 0.88rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 1rem; }
        .legal-ul { padding-left: 1.25rem; margin-bottom: 1rem; }
        .legal-ul li { font-size: 0.88rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 0.4rem; }
        .legal-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(212,165,55,0.2), transparent); margin: 2rem 0; }
        .legal-contact { background: rgba(212,165,55,0.06); border: 1px solid rgba(212,165,55,0.12); border-radius: 12px; padding: 1.25rem; margin-top: 2rem; }
        .legal-contact a { color: #d4a537; text-decoration: none; }
        .legal-contact a:hover { text-decoration: underline; }
        .legal-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        .legal-table th, .legal-table td { text-align: left; padding: 8px 12px; font-size: 0.82rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .legal-table th { color: #d4a537; font-weight: 600; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .legal-table td { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className="legal-container">
        <img src={SYSTM8_LOGO} alt="SYSTM8" className="legal-logo" />
        <a href="https://www.primeverseaccess.com" className="legal-back">← Back to PrimeVerse Access</a>

        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: March 2026</p>

        <p className="legal-p">
          1Move Academy (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates PrimeVerse Access (SYSTM8) at
          www.primeverseaccess.com. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you visit our platform. Please read this policy carefully. By using the platform,
          you consent to the practices described herein.
        </p>

        <h2 className="legal-h2">1. Information We Collect</h2>

        <h3 className="legal-h3">Personal Information You Provide</h3>
        <p className="legal-p">When you register or use our platform, we may collect:</p>
        <ul className="legal-ul">
          <li>Full name and email address</li>
          <li>Phone number (optional, for WhatsApp/Telegram contact)</li>
          <li>Profile photo</li>
          <li>Bio and personal description</li>
          <li>Social media links (TikTok, Instagram, Facebook, LinkedIn, YouTube, etc.)</li>
          <li>Referral/partner links (e.g., PuPrime affiliate links)</li>
          <li>Custom URL slug for your landing page</li>
          <li>Language preference</li>
        </ul>

        <h3 className="legal-h3">Information Collected Automatically</h3>
        <p className="legal-p">When visitors access your landing page or you use the dashboard, we automatically collect:</p>
        <ul className="legal-ul">
          <li>Page view data (timestamp, page visited)</li>
          <li>Referrer/traffic source (e.g., Facebook, Instagram, direct link, shared link)</li>
          <li>UTM parameters (utm_source, utm_medium)</li>
          <li>Device type (mobile or desktop, based on screen width)</li>
          <li>Browser type and operating system (via standard HTTP headers)</li>
        </ul>

        <h3 className="legal-h3">Lead Information</h3>
        <p className="legal-p">
          When visitors register through your landing page, we collect their name, email, phone number, and
          country to facilitate the lead registration process.
        </p>

        <h2 className="legal-h2">2. How We Use Your Information</h2>
        <p className="legal-p">We use the information we collect to:</p>
        <ul className="legal-ul">
          <li>Create and maintain your account and landing page</li>
          <li>Display your public profile and landing page to visitors</li>
          <li>Track page views, leads, and conversion metrics for your dashboard</li>
          <li>Send transactional emails (verification, lead notifications, welcome emails)</li>
          <li>Send feature announcements and product updates (you can opt out)</li>
          <li>Power AI tools (bio generator, post writer, content calendar) using your input</li>
          <li>Improve and optimize the platform</li>
          <li>Prevent fraud, abuse, and unauthorized access</li>
        </ul>

        <h2 className="legal-h2">3. Third-Party Services</h2>
        <p className="legal-p">We use the following third-party services to operate the platform:</p>

        <table className="legal-table">
          <thead>
            <tr><th>Service</th><th>Purpose</th><th>Data Shared</th></tr>
          </thead>
          <tbody>
            <tr><td>Supabase</td><td>Database, authentication, file storage</td><td>All account and platform data</td></tr>
            <tr><td>Resend</td><td>Transactional email delivery</td><td>Email address, name, email content</td></tr>
            <tr><td>Groq</td><td>AI content generation (bio, posts, captions)</td><td>Prompt text (topic, tone, language)</td></tr>
            <tr><td>Vercel</td><td>Hosting and deployment</td><td>Standard web request data</td></tr>
            <tr><td>PuPrime</td><td>Broker partner services (linked via referral URLs)</td><td>No data shared directly by us</td></tr>
          </tbody>
        </table>

        <p className="legal-p">
          Each third-party service has its own privacy policy. We encourage you to review their policies.
          We do not sell your personal information to any third party.
        </p>

        <h2 className="legal-h2">4. Cookies and Tracking</h2>
        <p className="legal-p">
          The platform uses essential cookies for authentication and session management via Supabase Auth.
          We do not use third-party advertising cookies or trackers. We track page views using our own
          internal analytics (stored in our Supabase database) rather than third-party analytics services
          like Google Analytics.
        </p>
        <p className="legal-p">
          We use URL parameters (?s=share, ?utm_source=, ?utm_medium=) to attribute traffic sources. These
          parameters are processed server-side and do not set cookies.
        </p>

        <h2 className="legal-h2">5. Email Communications</h2>
        <p className="legal-p">We send the following types of emails:</p>
        <ul className="legal-ul">
          <li><strong>Transactional:</strong> Email verification, password reset, lead notifications, UID verification — these are essential for platform operation</li>
          <li><strong>Product updates:</strong> Feature announcements, platform changes — sent to all registered users</li>
          <li><strong>Automated workflows:</strong> Lead nurture sequences, welcome emails — triggered by user actions</li>
        </ul>
        <p className="legal-p">
          You can opt out of non-essential emails by contacting support@primeverseaccess.com. Transactional
          emails required for account operation cannot be opted out of while your account is active.
        </p>

        <h2 className="legal-h2">6. Data Storage and Security</h2>
        <p className="legal-p">
          Your data is stored securely on Supabase infrastructure with row-level security (RLS) policies
          ensuring users can only access their own data. We use HTTPS encryption for all data in transit.
          Authentication tokens are managed securely via Supabase Auth with JWT tokens.
        </p>
        <p className="legal-p">
          While we implement commercially reasonable security measures, no method of transmission over the
          Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
        </p>

        <h2 className="legal-h2">7. Data Retention</h2>
        <p className="legal-p">
          We retain your personal data for as long as your account is active or as needed to provide services.
          Page view analytics data is retained indefinitely for historical metrics. If you delete your account,
          your personal data will be removed within 30 days, except where retention is required by law.
        </p>

        <h2 className="legal-h2">8. Your Rights</h2>
        <p className="legal-p">Depending on your jurisdiction, you may have the right to:</p>
        <ul className="legal-ul">
          <li><strong>Access</strong> the personal data we hold about you</li>
          <li><strong>Correct</strong> inaccurate or incomplete personal data</li>
          <li><strong>Delete</strong> your personal data (right to erasure)</li>
          <li><strong>Export</strong> your data in a portable format</li>
          <li><strong>Object</strong> to processing of your personal data</li>
          <li><strong>Withdraw consent</strong> where processing is based on consent</li>
        </ul>
        <p className="legal-p">
          To exercise any of these rights, please contact us at support@primeverseaccess.com. We will respond
          to your request within 30 days.
        </p>

        <h2 className="legal-h2">9. Children&apos;s Privacy</h2>
        <p className="legal-p">
          The platform is not intended for individuals under the age of 18. We do not knowingly collect
          personal information from children. If we become aware that we have collected data from a child
          under 18, we will take steps to delete such information promptly.
        </p>

        <h2 className="legal-h2">10. International Data Transfers</h2>
        <p className="legal-p">
          Your information may be transferred to and processed in countries other than your country of
          residence. These countries may have data protection laws that differ from your jurisdiction. By
          using the platform, you consent to such transfers. We ensure appropriate safeguards are in place
          in accordance with applicable data protection laws.
        </p>

        <h2 className="legal-h2">11. Changes to This Policy</h2>
        <p className="legal-p">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an
          updated &ldquo;Last updated&rdquo; date. We encourage you to review this page periodically. Your continued
          use of the platform after changes constitutes acceptance of the updated policy.
        </p>

        <div className="legal-divider" />

        <div className="legal-contact">
          <p className="legal-p" style={{ marginBottom: 0 }}>
            If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at{' '}
            <a href="mailto:support@primeverseaccess.com">support@primeverseaccess.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
