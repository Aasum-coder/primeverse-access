import type { NextConfig } from "next";

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const nextConfig: NextConfig = {
  // Prevent 307 redirects on POST requests to webhook routes
  // (Resend/svix webhook sender may POST to /api/inbound/email/ with
  // trailing slash — without this flag Next.js 307-redirects to the
  // non-trailing version, which webhook senders do not follow)
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      // Serve the real SYSTM8 logo for all PWA icon paths
      { source: '/icons/icon-192x192.png', destination: SYSTM8_LOGO },
      { source: '/icons/icon-512x512.png', destination: SYSTM8_LOGO },
      { source: '/icons/icon-maskable-192x192.png', destination: SYSTM8_LOGO },
      { source: '/icons/icon-maskable-512x512.png', destination: SYSTM8_LOGO },
    ]
  },
};

export default nextConfig;
