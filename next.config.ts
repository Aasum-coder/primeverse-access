import type { NextConfig } from "next";

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

const nextConfig: NextConfig = {
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
