import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = GeistSans;
const geistMono = GeistMono;

const logoUrl = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#D4A843',
};

export const metadata: Metadata = {
  title: "SYSTM8 by 1Move",
  description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-180x180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SYSTM8',
  },
  openGraph: {
    title: "SYSTM8 by 1Move",
    description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
    siteName: "SYSTM8 by 1Move",
    images: [{ url: logoUrl, width: 512, height: 512, alt: 'SYSTM8 by 1Move' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "SYSTM8 by 1Move",
    description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
    images: [logoUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <meta name="msapplication-TileColor" content="#1A1A2E" />
        <meta name="msapplication-TileImage" content="https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
