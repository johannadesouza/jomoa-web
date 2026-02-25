export default function AdminHome() {
  const sections = [
    { href: "/exercises", label: "Övningar", desc: "Hantera övningsbiblioteket" },
    { href: "/programs", label: "Program", desc: "Träningsprogram med block, veckor och pass" },
    { href: "/session-templates", label: "Passmallar", desc: "Fristående pass för utforska-flödet" },
    { href: "/articles", label: "Artiklar", desc: "Knowledge Hub – draft/publish-flöde" },
    { href: "/tips", label: "Tips", desc: "Tips och rekommendationer" },
  ];

  return (
    <div>
      <h1>JOMOA Admin – Content Management</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Hanterar content i Content DB. Ingen tillgång till persondata.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {sections.map((s) => (
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
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#976568" }}>{s.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
