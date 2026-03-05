import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface InsightTemplateRow {
  template_key: string;
  title: string;
  body: string;
  actions: string[];
}

async function getInsightTemplates(): Promise<InsightTemplateRow[]> {
  const { data } = await adminContentClient
    .from("insight_templates")
    .select("*")
    .order("template_key");
  return (data ?? []) as InsightTemplateRow[];
}

function actionsToText(arr: string[]): string {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function textToActions(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function updateTemplate(formData: FormData) {
  "use server";
  const template_key = (formData.get("template_key") as string)?.trim();
  if (!template_key) return;
  const actionsText = (formData.get("actions") as string) ?? "";
  const actions = textToActions(actionsText);
  await adminContentClient.from("insight_templates").update({
    title: (formData.get("title") as string)?.trim(),
    body: (formData.get("body") as string)?.trim(),
    actions,
  }).eq("template_key", template_key);
  revalidatePath("/insight-templates");
  redirect("/insight-templates?saved=1");
}

async function createTemplate(formData: FormData) {
  "use server";
  const template_key = (formData.get("template_key") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  if (!template_key || !title || !body) return;
  const actionsText = (formData.get("actions") as string) ?? "";
  const actions = textToActions(actionsText);
  await adminContentClient.from("insight_templates").insert({
    template_key,
    title,
    body,
    actions: actions.length > 0 ? actions : [],
  });
  revalidatePath("/insight-templates");
  redirect("/insight-templates?saved=1");
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #f0d6d7",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#462324",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #f0d6d7",
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "#462324",
  color: "#FEE7AB",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const summaryStyle: React.CSSProperties = {
  cursor: "pointer",
  display: "inline-block",
  listStyle: "none",
  padding: "10px 20px",
  background: "#462324",
  color: "#FEE7AB",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
};

export default async function InsightTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const templates = await getInsightTemplates();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Insight-templates</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Daglig insight på dashboarden – titel, body och actions per template_key (t.ex. menstruation_low, follicular_high, default). Appen använder <code>getInsightTemplateKey()</code> och hämtar copy här.
      </p>

      <details style={{ marginBottom: 24 }}>
        <summary style={summaryStyle}>+ Ny template</summary>
        <form action={createTemplate} style={{ background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 8, display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>template_key * (t.ex. custom_low)</label>
            <input name="template_key" required placeholder="custom_low" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>title *</label>
            <input name="title" required placeholder="Prioritera återhämtning" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>body *</label>
            <textarea name="body" required rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>actions (en per rad)</label>
            <textarea name="actions" rows={3} placeholder="Minska volym med 10–20%&#10;Överväg stretching" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {templates.map((row) => (
          <div key={row.template_key} style={cardStyle}>
            <form action={updateTemplate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="hidden" name="template_key" value={row.template_key} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, alignItems: "start" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>template_key</label>
                  <input value={row.template_key} readOnly style={{ ...inputStyle, background: "#f5f5f5", fontFamily: "monospace" }} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>title *</label>
                  <input name="title" defaultValue={row.title} required style={inputStyle} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>body *</label>
                  <textarea name="body" defaultValue={row.body} required rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>actions (en per rad)</label>
                  <textarea name="actions" defaultValue={actionsToText(row.actions)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>
              <button type="submit" style={saveBtnStyle}>Spara</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
