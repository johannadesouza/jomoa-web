export default function AdminHome() {
  const sections = [
    { group: "Träning", items: [
      { href: "/exercises", label: "Övningar", desc: "Hantera övningsbiblioteket" },
      { href: "/programs", label: "Program", desc: "Träningsprogram med block, veckor och pass" },
      { href: "/session-templates", label: "Passmallar", desc: "Fristående pass för utforska-flödet" },
    ]},
    { group: "Cykel & välmående", items: [
      { href: "/cycle-phases", label: "Cykelns faser", desc: "Redigera fasernas beskrivning och hormoner" },
      { href: "/cycle-tips", label: "Cykeltips", desc: "Tränings- och välmåendetips per fas" },
      { href: "/readiness-insights", label: "Readiness-insikter", desc: "Insikter baserat på readiness-poäng (0–100)" },
    ]},
    { group: "Innehåll", items: [
      { href: "/articles", label: "Artiklar", desc: "Knowledge Hub – draft/publish-flöde" },
      { href: "/tips", label: "Tips", desc: "Tips och rekommendationer" },
    ]},
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>JOMOA Admin</h1>
      <p style={{ color: "#976568", marginBottom: 40 }}>
        Content Management – ingen tillgång till persondata.
      </p>
      {sections.map((section) => (
        <div key={section.group} style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#976568",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: 12,
          }}>
            {section.group}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {section.items.map((s) => (
              <a
                key={s.href}
                href={s.href}
                style={{
                  display: "block",
                  padding: "20px 24px",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #f0d6d7",
                  textDecoration: "none",
                  color: "#462324",
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#976568" }}>{s.desc}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
