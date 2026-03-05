import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter – single font for clean, modern product (Strava/Whoop/Notion-style)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JOMOA – Kontinuitetsfokuserad träning för alla",
  description: "Träning som anpassar sig efter hur du mår och, valfritt, din cykel. Stöd genom mens, klimakterie eller graviditet. För privatpersoner och företag.",
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
    title: "JOMOA – Continuity-first training for everyone",
    description: "Training that adapts to how you feel and, optionally, your cycle. Support through period, menopause or pregnancy. For individuals and companies.",
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
    title: "JOMOA – Continuity-first training for everyone",
    description: "Training that adapts to how you feel and, optionally, your cycle. Cycle optional.",
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="dark">
      <body
        className={`${inter.variable} font-inter antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
