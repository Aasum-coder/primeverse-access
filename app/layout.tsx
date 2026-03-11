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

export const metadata: Metadata = {
  title: "1Move Academy Access Portal",
  description: "Access portal for 1Move Academy distributors and members.",
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
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          onFocus={(e) => {
            e.currentTarget.style.cssText =
              "position:fixed;top:0;left:0;width:auto;height:auto;padding:0.5rem 1rem;background:#d4a537;color:#000;z-index:9999;font-weight:600;border-radius:0 0 4px 0;";
          }}
          onBlur={(e) => {
            e.currentTarget.style.cssText =
              "position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;";
          }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
