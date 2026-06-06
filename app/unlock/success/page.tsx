export default function UnlockSuccessPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #faf6ef; color: #1a1a1a; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .ok-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.25rem; }
        .ok-mark { font-family: 'Cormorant Garamond', serif; font-size: 0.85rem; letter-spacing: 0.4em; text-transform: uppercase; color: #a98a3b; margin-bottom: 2rem; }
        .ok-card { width: 100%; max-width: 460px; background: #ffffff; border: 1px solid #e8dcb8; border-radius: 14px; padding: 2.5rem 2rem; text-align: center; box-shadow: 0 8px 32px rgba(20, 14, 0, 0.06); }
        .ok-tick { width: 64px; height: 64px; border-radius: 50%; background: rgba(45, 122, 58, 0.12); border: 1px solid rgba(45, 122, 58, 0.4); color: #2d7a3a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 700; margin-bottom: 1.5rem; }
        .ok-headline { font-family: 'Cormorant Garamond', serif; font-size: 2rem; line-height: 1.2; color: #1a1a1a; margin-bottom: 0.65rem; }
        .ok-sub { font-size: 1rem; line-height: 1.65; color: #555; margin-bottom: 1.25rem; }
        .ok-footnote { font-family: 'Cormorant Garamond', serif; font-size: 0.9rem; color: #a98a3b; letter-spacing: 0.06em; font-style: italic; }
      `}</style>
      <div className="ok-wrap">
        <div className="ok-mark">1Move</div>
        <div className="ok-card">
          <div className="ok-tick" aria-hidden="true">✓</div>
          <h1 className="ok-headline">You&apos;re in.</h1>
          <p className="ok-sub">
            Check your inbox — your access email is on its way<br />
            with Telegram + Primeverse details.
          </p>
          <p className="ok-footnote">Welcome to 1Move.</p>
        </div>
      </div>
    </>
  )
}
