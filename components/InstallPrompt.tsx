'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed before
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS prompt after a delay if not installed
    if (ios && !standalone) {
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
      zIndex: 50, maxWidth: '28rem', margin: '0 auto',
    }}>
      <div style={{
        borderRadius: '1rem',
        border: '1px solid rgba(212, 168, 67, 0.3)',
        background: '#1A1A2E',
        padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            flexShrink: 0, borderRadius: '0.75rem',
            background: 'rgba(212, 168, 67, 0.1)', padding: '0.5rem',
            fontSize: '1.5rem',
          }}>
            S8
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 600, color: 'white', margin: 0, fontSize: '0.95rem' }}>Install SYSTM8</h3>
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#9ca3af' }}>
              {isIOS
                ? 'Tap the share button, then "Add to Home Screen"'
                : 'Add to your home screen for quick access'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none', border: 'none', color: '#6b7280',
              cursor: 'pointer', fontSize: '1.1rem', padding: 0,
            }}
          >
            ✕
          </button>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              marginTop: '0.75rem', width: '100%', borderRadius: '0.75rem',
              background: '#D4A843', padding: '0.625rem',
              fontWeight: 600, color: '#1A1A2E', border: 'none',
              cursor: 'pointer', fontSize: '0.9rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#E5B954')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#D4A843')}
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
