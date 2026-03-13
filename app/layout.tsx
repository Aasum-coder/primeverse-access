import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const logoUrl = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png'

export const metadata: Metadata = {
  title: "1Move Academy Access Portal",
  description: "Your gateway to the world's best trading community — powered by 1Move × PrimeVerse",
  icons: {
    icon: logoUrl,
    apple: logoUrl,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
