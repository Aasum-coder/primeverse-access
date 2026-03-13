import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const logoUrl = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#D4A843',
};

export const metadata: Metadata = {
  title: "1Move Academy Access Portal",
  description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
  manifest: '/manifest.json',
  icons: {
    icon: logoUrl,
    apple: logoUrl,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SYSTM8',
  },
  openGraph: {
    title: "1Move Academy Access Portal",
    description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
    siteName: "1Move Academy",
    images: [{ url: logoUrl, width: 512, height: 512, alt: '1Move Academy' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "1Move Academy Access Portal",
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#1A1A2E" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
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
