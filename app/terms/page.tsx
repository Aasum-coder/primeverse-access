'use client'

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

export default function TermsOfService() {
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
        .legal-p { font-size: 0.88rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 1rem; }
        .legal-ul { padding-left: 1.25rem; margin-bottom: 1rem; }
        .legal-ul li { font-size: 0.88rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 0.4rem; }
        .legal-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(212,165,55,0.2), transparent); margin: 2rem 0; }
        .legal-contact { background: rgba(212,165,55,0.06); border: 1px solid rgba(212,165,55,0.12); border-radius: 12px; padding: 1.25rem; margin-top: 2rem; }
        .legal-contact a { color: #d4a537; text-decoration: none; }
        .legal-contact a:hover { text-decoration: underline; }
      `}</style>

      <div className="legal-container">
        <img src={SYSTM8_LOGO} alt="SYSTM8" className="legal-logo" />
        <a href="https://www.primeverseaccess.com" className="legal-back">← Back to PrimeVerse Access</a>

        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: March 2026</p>

        <p className="legal-p">
          Welcome to PrimeVerse Access (SYSTM8), operated by 1Move Academy. By accessing or using our platform
          at www.primeverseaccess.com, you agree to be bound by these Terms of Service. If you do not agree
          to these terms, please do not use our services.
        </p>

        <h2 className="legal-h2">1. Definitions</h2>
        <p className="legal-p">
          &ldquo;Platform&rdquo; refers to PrimeVerse Access (SYSTM8), including the website, dashboard, landing pages,
          and all related tools and services. &ldquo;User&rdquo; or &ldquo;you&rdquo; refers to any individual who creates an account
          or accesses the platform. &ldquo;We,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo; refers to 1Move Academy.
        </p>

        <h2 className="legal-h2">2. Eligibility</h2>
        <p className="legal-p">
          You must be at least 18 years of age and have the legal capacity to enter into binding agreements
          to use this platform. By registering, you represent and warrant that you meet these requirements.
        </p>

        <h2 className="legal-h2">3. Account Registration</h2>
        <p className="legal-p">
          To access certain features, you must create an account by providing accurate and complete information.
          You are responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account. You must notify us immediately of any unauthorized use.
        </p>

        <h2 className="legal-h2">4. Acceptable Use</h2>
        <p className="legal-p">You agree NOT to:</p>
        <ul className="legal-ul">
          <li>Use the platform for any unlawful purpose or in violation of any applicable laws or regulations</li>
          <li>Upload, post, or share content that is defamatory, obscene, fraudulent, misleading, or harmful</li>
          <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
          <li>Attempt to gain unauthorized access to the platform, other accounts, or any related systems</li>
          <li>Use automated scripts, bots, or scrapers to access or collect data from the platform</li>
          <li>Make false or misleading income claims or guarantees related to trading or financial services</li>
          <li>Spam, harass, or send unsolicited communications to other users or leads</li>
          <li>Interfere with or disrupt the integrity or performance of the platform</li>
        </ul>

        <h2 className="legal-h2">5. User Content</h2>
        <p className="legal-p">
          You retain ownership of content you create on the platform (bios, posts, landing page text). However,
          by using the platform, you grant 1Move Academy a non-exclusive, royalty-free license to display,
          distribute, and use your content as necessary to operate and promote the platform. You are solely
          responsible for the accuracy and legality of your content.
        </p>

        <h2 className="legal-h2">6. AI-Generated Content</h2>
        <p className="legal-p">
          The platform provides AI-powered tools (bio generator, post writer, caption generator, content calendar)
          that generate content suggestions. AI-generated content is provided &ldquo;as is&rdquo; and you are responsible
          for reviewing, editing, and ensuring compliance with applicable laws before publishing. We do not
          guarantee the accuracy, originality, or legal compliance of AI-generated content.
        </p>

        <h2 className="legal-h2">7. Third-Party Services</h2>
        <p className="legal-p">
          The platform integrates with third-party services including but not limited to PuPrime (broker services),
          Supabase (data infrastructure), Resend (email delivery), and Groq (AI processing). Your use of these
          services is subject to their respective terms and privacy policies. We are not responsible for the
          availability, accuracy, or conduct of third-party services.
        </p>

        <h2 className="legal-h2">8. Financial Disclaimer</h2>
        <p className="legal-p">
          PrimeVerse Access is a marketing and education platform. Nothing on this platform constitutes financial
          advice, investment advice, or a recommendation to trade. Trading involves substantial risk of loss and
          is not suitable for all investors. Past performance is not indicative of future results. Users are solely
          responsible for their own trading decisions and should consult a qualified financial advisor.
        </p>

        <h2 className="legal-h2">9. Account Termination</h2>
        <p className="legal-p">
          We reserve the right to suspend or terminate your account at any time, with or without notice, for
          conduct that we determine violates these Terms, is harmful to other users, or is otherwise objectionable.
          You may delete your account at any time by contacting support. Upon termination, your right to access
          the platform ceases immediately.
        </p>

        <h2 className="legal-h2">10. Disclaimer of Warranties</h2>
        <p className="legal-p">
          The platform is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind,
          whether express or implied, including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement. We do not warrant that the platform will
          be uninterrupted, error-free, secure, or free of viruses or other harmful components.
        </p>

        <h2 className="legal-h2">11. Limitation of Liability</h2>
        <p className="legal-p">
          To the maximum extent permitted by applicable law, 1Move Academy and its officers, directors,
          employees, and agents shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages, including but not limited to loss of profits, data, or business opportunities,
          arising out of or in connection with your use of or inability to use the platform, even if we have
          been advised of the possibility of such damages.
        </p>

        <h2 className="legal-h2">12. Indemnification</h2>
        <p className="legal-p">
          You agree to indemnify, defend, and hold harmless 1Move Academy and its affiliates from and against
          any claims, liabilities, damages, losses, and expenses arising from your use of the platform, your
          content, or your violation of these Terms.
        </p>

        <h2 className="legal-h2">13. Changes to Terms</h2>
        <p className="legal-p">
          We reserve the right to modify these Terms at any time. Changes will be posted on this page with an
          updated &ldquo;Last updated&rdquo; date. Your continued use of the platform after changes constitutes acceptance
          of the revised Terms. We encourage you to review this page periodically.
        </p>

        <h2 className="legal-h2">14. Governing Law</h2>
        <p className="legal-p">
          These Terms shall be governed by and construed in accordance with applicable international commercial
          law. Any disputes arising under or in connection with these Terms shall be resolved through good-faith
          negotiation, and if necessary, binding arbitration.
        </p>

        <div className="legal-divider" />

        <div className="legal-contact">
          <p className="legal-p" style={{ marginBottom: 0 }}>
            If you have questions about these Terms, contact us at{' '}
            <a href="mailto:support@primeverseaccess.com">support@primeverseaccess.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
