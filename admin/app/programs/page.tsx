import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";

interface Program {
  id: string;
  name: string;
  description: string | null;
  target_goal: string | null;
  target_duration_weeks: number | null;
  is_template: boolean;
}

async function getPrograms(): Promise<Program[]> {
  const { data } = await adminContentClient
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks, is_template")
    .order("name");
  return (data ?? []) as Program[];
}

async function createProgram(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  await adminContentClient.from("training_programs").insert({
    name: name.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    target_goal: (formData.get("target_goal") as string)?.trim() || null,
    target_duration_weeks: formData.get("target_duration_weeks") ? parseInt(formData.get("target_duration_weeks") as string, 10) : null,
    is_template: true,
  });
  revalidatePath("/programs");
  redirect("/programs?saved=1");
}

async function updateProgram(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("training_programs").update({
    name: (formData.get("name") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    target_goal: (formData.get("target_goal") as string) || null,
    target_duration_weeks: formData.get("target_duration_weeks") ? parseInt(formData.get("target_duration_weeks") as string, 10) : null,
  }).eq("id", id);
  revalidatePath("/programs");
  redirect("/programs?saved=1");
}

async function deleteProgram(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("training_programs").delete().eq("id", id);
  revalidatePath("/programs");
  redirect("/programs?saved=1");
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Gå ner i vikt",
  build_muscle: "Bygga muskler",
  improve_fitness: "Förbättra kondition",
  stay_active: "Hålla igång",
  reduce_stress: "Minska stress",
  hormonal_balance: "Hormonell balans",
  strength: "Styrka",
};

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const programs = await getPrograms();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1>Program ({programs.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary style={summaryStyle}>+ Nytt program</summary>
        <form action={createProgram} style={formGridStyle}>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Namn *</label>
            <input name="name" required placeholder="T.ex. Styrka för nybörjare" style={inputStyle} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Beskrivning</label>
            <textarea name="description" rows={3} placeholder="Beskrivning av programmet..." style={textareaStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Mål</label>
            <select name="target_goal" style={inputStyle}>
              <option value="">– Välj mål –</option>
              {Object.entries(GOAL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Antal veckor</label>
            <input name="target_duration_weeks" type="number" min={1} max={52} placeholder="T.ex. 8" style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara program</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {programs.map((p) => (
          <details key={p.id} style={rowDetailsStyle}>
            <summary style={rowSummaryStyle}>
              <span style={{ fontWeight: 600, flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: "#976568", marginRight: 8 }}>
                {p.target_goal ? (GOAL_LABELS[p.target_goal] ?? p.target_goal) : "–"}
                {p.target_duration_weeks ? ` · ${p.target_duration_weeks} v` : ""}
              </span>
            </summary>
            <div style={{ padding: "16px 16px 16px 20px", background: "#FFFBF7", borderTop: "1px solid #f0d6d7" }}>
              <form action={updateProgram} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560 }}>
                <input type="hidden" name="id" value={p.id} />
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Namn *</label>
                  <input name="name" defaultValue={p.name} required style={inputStyle} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Beskrivning</label>
                  <textarea name="description" defaultValue={p.description ?? ""} rows={3} style={textareaStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Mål</label>
                  <select name="target_goal" defaultValue={p.target_goal ?? ""} style={inputStyle}>
                    <option value="">– Välj mål –</option>
                    {Object.entries(GOAL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Antal veckor</label>
                  <input name="target_duration_weeks" type="number" min={1} max={52} defaultValue={p.target_duration_weeks ?? ""} style={inputStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                  <button type="submit" style={saveBtnStyle}>Spara ändringar</button>
                  <ConfirmDeleteButton action={deleteProgram} formData={{ id: p.id }} style={deleteBtnStyle} />
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
