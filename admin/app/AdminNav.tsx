"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseStyle: React.CSSProperties = {
  color: "#FEE7AB",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  display: "block",
};
const activeStyle: React.CSSProperties = {
  ...baseStyle,
  background: "rgba(253, 180, 153, 0.25)",
  color: "#FDB499",
  fontWeight: 600,
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} style={isActive ? activeStyle : baseStyle}>
      {children}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      width: 220,
      background: "#462324",
      color: "#FEE7AB",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <Link
        href="/"
        style={{
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 8,
          color: "#FDB499",
          textDecoration: "none",
          padding: "8px 12px",
          borderRadius: 8,
          ...(pathname === "/" ? { background: "rgba(253, 180, 153, 0.25)" } : {}),
        }}
      >
        JOMOA Admin
      </Link>
      <div style={{ fontSize: 11, color: "#976568", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 8 }}>Träning</div>
      <NavLink href="/exercises">Övningar</NavLink>
      <NavLink href="/programs">Program</NavLink>
      <NavLink href="/session-templates">Passmallar</NavLink>
      <div style={{ fontSize: 11, color: "#976568", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 8 }}>Cykel</div>
      <NavLink href="/cycle-phases">Cykelns faser</NavLink>
      <NavLink href="/cycle-tips">Cykeltips</NavLink>
      <NavLink href="/readiness-insights">Readiness-insikter</NavLink>
      <NavLink href="/insight-templates">Insight-templates</NavLink>
      <div style={{ fontSize: 11, color: "#976568", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 8 }}>Onboarding & symtom</div>
      <NavLink href="/goals">Mål</NavLink>
      <NavLink href="/goal-type-options">Resans mål</NavLink>
      <NavLink href="/symptom-options">Symtomalternativ</NavLink>
      <NavLink href="/symptom-relief">Symtomtips</NavLink>
      <NavLink href="/onboarding-copy">Onboarding-texter</NavLink>
      <NavLink href="/app-copy">App-copy</NavLink>
      <div style={{ fontSize: 11, color: "#976568", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 8 }}>Innehåll</div>
      <NavLink href="/articles">Artiklar</NavLink>
      <NavLink href="/tips">Tips</NavLink>
    </nav>
  );
}
