import { adminContentClient } from "@/lib/contentClient";

const CONTENT_TABLES = [
  "exercises",
  "training_programs",
  "session_templates",
  "cycle_phases",
  "phase_training_tips",
  "phase_wellness_tips",
  "readiness_insights",
  "training_goals",
  "symptom_options",
  "symptom_relief_tips",
  "onboarding_copy",
  "articles",
  "tips_library",
  "goal_type_options",
  "insight_templates",
  "app_copy",
] as const;

async function getContentTableCounts(): Promise<{ table: string; count: number | null; error?: string }[]> {
  const results = await Promise.all(
    CONTENT_TABLES.map(async (table) => {
      const { count, error } = await adminContentClient
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) return { table, count: null, error: error.message };
      return { table, count: count ?? 0 };
    })
  );
  return results;
}

export default async function AdminHome() {
  const tableCounts = await getContentTableCounts();
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
      { href: "/insight-templates", label: "Insight-templates", desc: "Daglig insight på dashboard – titel, body, actions per template_key" },
    ]},
    { group: "Onboarding & symtom", items: [
      { href: "/goals", label: "Mål", desc: "Måltyper för onboarding" },
      { href: "/goal-type-options", label: "Resans mål", desc: "Alternativ per måltyp (fitness, nutrition, wellness, event)" },
      { href: "/symptom-options", label: "Symtomalternativ", desc: "Symtomlistor" },
      { href: "/symptom-relief", label: "Symtomtips", desc: "Tips vid symtom" },
      { href: "/onboarding-copy", label: "Onboarding-texter", desc: "Texter i onboarding-flödet" },
      { href: "/app-copy", label: "App-copy", desc: "Profilvarierande texter (welcome, dashboard, insight)" },
    ]},
    { group: "Innehåll", items: [
      { href: "/articles", label: "Artiklar", desc: "Knowledge Hub – draft/publish-flöde" },
      { href: "/tips", label: "Tips", desc: "Tips och rekommendationer" },
    ]},
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>JOMOA Admin</h1>
      <p style={{ color: "#976568", marginBottom: 24 }}>
        Content Management – ingen tillgång till persondata.
      </p>

      <details style={{ marginBottom: 40 }}>
        <summary style={{
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          color: "#976568",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Content DB – tabellöversikt
        </summary>
        <div style={{
          marginTop: 12,
          padding: 16,
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #f0d6d7",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
          fontSize: 13,
        }}>
          {tableCounts.map(({ table, count, error }) => (
            <div key={table} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: "#462324", fontFamily: "monospace" }}>{table}</span>
              <span style={{ color: error ? "#C62828" : "#976568", fontWeight: 600 }}>
                {error ?? (count ?? "–")}
              </span>
            </div>
          ))}
        </div>
      </details>

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
