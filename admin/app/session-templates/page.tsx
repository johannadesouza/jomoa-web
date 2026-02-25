import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface SessionTemplate {
  id: string;
  name: string;
  focus: string;
  description: string | null;
  duration_minutes: number | null;
}

async function getTemplates(): Promise<SessionTemplate[]> {
  const { data } = await adminContentClient
    .from("session_templates")
    .select("id, name, focus, description, duration_minutes")
    .order("name");
  return (data ?? []) as SessionTemplate[];
}

async function createTemplate(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const focus = formData.get("focus") as string;
  if (!name?.trim() || !focus?.trim()) return;
  await adminContentClient.from("session_templates").insert({
    name: name.trim(),
    focus: focus.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    duration_minutes: formData.get("duration_minutes") ? parseInt(formData.get("duration_minutes") as string, 10) : null,
  });
  revalidatePath("/session-templates");
}

async function updateTemplate(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("session_templates").update({
    name: (formData.get("name") as string)?.trim(),
    focus: (formData.get("focus") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    duration_minutes: formData.get("duration_minutes") ? parseInt(formData.get("duration_minutes") as string, 10) : null,
  }).eq("id", id);
  revalidatePath("/session-templates");
}

async function deleteTemplate(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("session_templates").delete().eq("id", id);
  revalidatePath("/session-templates");
}

const FOCUS_OPTIONS = ["Styrka", "Kondition", "Pilates", "Yoga", "Barre", "Recovery", "Mindfulness", "Pre"];

export default async function SessionTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div>
      <h1>Passmallar ({templates.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary style={summaryStyle}>+ Ny passmall</summary>
        <form action={createTemplate} style={formGridStyle}>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Namn *</label>
            <input name="name" required placeholder="T.ex. Express Styrka" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Fokus *</label>
            <input name="focus" required list="focus-options" placeholder="T.ex. Styrka" style={inputStyle} />
            <datalist id="focus-options">
              {FOCUS_OPTIONS.map((f) => <option key={f} value={f} />)}
            </datalist>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Längd (min)</label>
            <input name="duration_minutes" type="number" min={5} max={180} placeholder="T.ex. 45" style={inputStyle} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Beskrivning</label>
            <textarea name="description" rows={2} placeholder="Kort beskrivning av passet..." style={textareaStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara passmall</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {templates.map((t) => (
          <details key={t.id} style={rowDetailsStyle}>
            <summary style={rowSummaryStyle}>
              <span style={{ fontWeight: 600, flex: 1 }}>{t.name}</span>
              <span style={{ fontSize: 12, color: "#976568", marginRight: 8 }}>
                {t.focus}{t.duration_minutes ? ` · ${t.duration_minutes} min` : ""}
              </span>
            </summary>
            <div style={{ padding: "16px 16px 16px 20px", background: "#FFFBF7", borderTop: "1px solid #f0d6d7" }}>
              <form action={updateTemplate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560 }}>
                <input type="hidden" name="id" value={t.id} />
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Namn *</label>
                  <input name="name" defaultValue={t.name} required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Fokus *</label>
                  <input name="focus" defaultValue={t.focus} required list="focus-options-edit" style={inputStyle} />
                  <datalist id="focus-options-edit">
                    {FOCUS_OPTIONS.map((f) => <option key={f} value={f} />)}
                  </datalist>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Längd (min)</label>
                  <input name="duration_minutes" type="number" min={5} max={180} defaultValue={t.duration_minutes ?? ""} style={inputStyle} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Beskrivning</label>
                  <textarea name="description" defaultValue={t.description ?? ""} rows={2} style={textareaStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                  <button type="submit" style={saveBtnStyle}>Spara ändringar</button>
                  <button formAction={deleteTemplate} style={deleteBtnStyle}>Ta bort</button>
                </div>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

const summaryStyle: React.CSSProperties = {
  cursor: "pointer", display: "inline-block",
  padding: "10px 20px", background: "#462324", color: "#FEE7AB",
  borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16, listStyle: "none",
};
const formGridStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12,
  padding: 24, marginTop: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
};
const rowDetailsStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 8, border: "1px solid #f0d6d7", overflow: "hidden",
};
const rowSummaryStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: "12px 16px", cursor: "pointer", gap: 8,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #f0d6d7",
  fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical" } as React.CSSProperties;
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px", background: "transparent", color: "#E57373",
  border: "1px solid #E57373", borderRadius: 8, fontSize: 13, cursor: "pointer",
};
