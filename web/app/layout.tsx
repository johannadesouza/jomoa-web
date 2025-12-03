import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

// League Spartan from Google Fonts
const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JOMOA Coach - Train in rhythm",
  description: "Smarter, more empathetic training — powered by cyclical intelligence.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '180x180' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "JOMOA Coach - Train in rhythm",
    description: "Smarter, more empathetic training — powered by cyclical intelligence.",
    type: "website",
    locale: "sv_SE",
    alternateLocale: "en_US",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'JOMOA Coach',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOMOA Coach - Train in rhythm",
    description: "Smarter, more empathetic training — powered by cyclical intelligence.",
    images: ['/opengraph-image.png'],
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
        className={`${leagueSpartan.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
