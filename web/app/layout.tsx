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
