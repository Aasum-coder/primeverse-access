interface Props {
  searchParams: Promise<{ reason?: string }>
}

const messages: Record<string, string> = {
  missing_token: 'This link is missing its key. Please use the link from your welcome email.',
  invalid_token: "This link has expired or isn't valid. Please request a new welcome email.",
}

export default async function UnlockErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams
  const message = messages[reason || ''] || 'Something went wrong with your link.'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #faf6ef; color: #1a1a1a; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .er-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.25rem; }
        .er-mark { font-family: 'Cormorant Garamond', serif; font-size: 0.85rem; letter-spacing: 0.4em; text-transform: uppercase; color: #a98a3b; margin-bottom: 2rem; }
        .er-card { width: 100%; max-width: 460px; background: #ffffff; border: 1px solid #e8dcb8; border-radius: 14px; padding: 2.5rem 2rem; text-align: center; box-shadow: 0 8px 32px rgba(20, 14, 0, 0.06); }
        .er-cross { width: 64px; height: 64px; border-radius: 50%; background: rgba(185, 74, 55, 0.10); border: 1px solid rgba(185, 74, 55, 0.4); color: #b94a37; display: inline-flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 700; margin-bottom: 1.5rem; }
        .er-headline { font-family: 'Cormorant Garamond', serif; font-size: 1.7rem; line-height: 1.2; color: #1a1a1a; margin-bottom: 0.75rem; }
        .er-sub { font-size: 0.95rem; line-height: 1.65; color: #555; margin-bottom: 1.5rem; }
        .er-cta { display: inline-block; padding: 0.85rem 1.5rem; background: #c9a84c; border-radius: 8px; color: #1a1a1a; font-size: 0.92rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; }
        .er-cta:hover { background: #d4b65e; }
      `}</style>
      <div className="er-wrap">
        <div className="er-mark">1Move</div>
        <div className="er-card">
          <div className="er-cross" aria-hidden="true">×</div>
          <h1 className="er-headline">We couldn&apos;t open this link</h1>
          <p className="er-sub">{message}</p>
          <a className="er-cta" href="https://1moveacademy.com">Back to 1Move</a>
        </div>
      </div>
    </>
  )
}
