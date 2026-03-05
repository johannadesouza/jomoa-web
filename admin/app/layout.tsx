import type { Metadata } from "next";
import "./globals.css";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "JOMOA Admin",
  description: "Hantera content – övningar, program, artiklar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <AdminNav />
          <main style={{ flex: 1, padding: "32px 40px", background: "#FFFBF7" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
