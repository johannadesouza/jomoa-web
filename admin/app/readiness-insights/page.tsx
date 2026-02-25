import { adminContentClient } from "../../lib/contentClient";
import { revalidatePath } from "next/cache";

async function getInsights() {
  const { data } = await adminContentClient
    .from("readiness_insights")
    .select("*")
    .order("readiness_min");
  return data ?? [];
}

async function addInsight(formData: FormData) {
  "use server";
  await adminContentClient.from("readiness_insights").insert({
    readiness_min: Number(formData.get("readiness_min")),
    readiness_max: Number(formData.get("readiness_max")),
    title: formData.get("title"),
    body: formData.get("body"),
    suggestion: formData.get("suggestion") || null,
  });
  revalidatePath("/readiness-insights");
}

async function deleteInsight(formData: FormData) {
  "use server";
  await adminContentClient.from("readiness_insights").delete().eq("id", formData.get("id"));
  revalidatePath("/readiness-insights");
}

async function updateInsight(formData: FormData) {
  "use server";
  await adminContentClient.from("readiness_insights").update({
    title: formData.get("title"),
    body: formData.get("body"),
    suggestion: formData.get("suggestion") || null,
  }).eq("id", formData.get("id"));
  revalidatePath("/readiness-insights");
}

function readinessColor(min: number): string {
  if (min <= 30) return "#E57373";
  if (min <= 50) return "#FFB74D";
  if (min <= 70) return "#81C784";
  if (min <= 85) return "#4CAF50";
  return "#2E7D32";
}

export default async function ReadinessInsightsPage() {
  const insights = await getInsights();

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Readiness-insikter</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Insikter visas på dashboarden baserat på användarens readiness-poäng (0–100).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {insights.map((ins: any) => {
          const color = readinessColor(ins.readiness_min);
          return (
            <div key={ins.id} style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #f0d6d7",
              overflow: "hidden",
            }}>
              <div style={{
                background: color + "22",
                borderLeft: `4px solid ${color}`,
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Poäng {ins.readiness_min}–{ins.readiness_max}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: color,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {ins.readiness_min <= 30 ? "Låg" :
                   ins.readiness_min <= 50 ? "Måttlig" :
                   ins.readiness_min <= 70 ? "Bra" :
                   ins.readiness_min <= 85 ? "Hög" : "Optimal"}
                </div>
              </div>
              <form action={updateInsight} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="hidden" name="id" value={ins.id} />
                <input name="title" defaultValue={ins.title} style={inputStyle} />
                <textarea name="body" defaultValue={ins.body} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                <input name="suggestion" defaultValue={ins.suggestion ?? ""} placeholder="Konkret åtgärd (valfri)" style={inputStyle} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" style={saveBtnStyle}>Spara</button>
                  <button formAction={deleteInsight} style={deleteBtnStyle}>Ta bort</button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      <div style={{
        background: "#FFFBF7",
        borderRadius: 12,
        border: "1px dashed #f0d6d7",
        padding: "24px",
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Lägg till ny insikt</h3>
        <form action={addInsight} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Min poäng</label>
              <input name="readiness_min" type="number" min={0} max={100} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Max poäng</label>
              <input name="readiness_max" type="number" min={0} max={100} required style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Titel</label>
            <input name="title" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Beskrivning</label>
            <textarea name="body" rows={2} required style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>Konkret åtgärd (valfri)</label>
            <input name="suggestion" style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>+ Lägg till insikt</button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #f0d6d7",
  fontSize: 14,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#462324",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const saveBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "8px 20px",
  background: "#462324",
  color: "#FEE7AB",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  color: "#E57373",
  border: "1px solid #E57373",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};
