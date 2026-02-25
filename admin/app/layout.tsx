import type { Metadata } from "next";
import "./globals.css";

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
          <nav style={{
            width: 220,
            background: "#462324",
            color: "#FEE7AB",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, color: "#FDB499" }}>
              JOMOA Admin
            </div>
            <NavLink href="/exercises">Övningar</NavLink>
            <NavLink href="/programs">Program</NavLink>
            <NavLink href="/session-templates">Passmallar</NavLink>
            <NavLink href="/articles">Artiklar</NavLink>
            <NavLink href="/tips">Tips</NavLink>
          </nav>
          <main style={{ flex: 1, padding: "32px 40px", background: "#FFFBF7" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        color: "#FEE7AB",
        textDecoration: "none",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </a>
  );
}
