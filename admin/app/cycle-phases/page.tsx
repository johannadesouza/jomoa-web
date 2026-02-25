import { adminContentClient } from "../../lib/contentClient";
import { revalidatePath } from "next/cache";

async function getPhases() {
  const { data } = await adminContentClient
    .from("cycle_phases")
    .select("*")
    .order("order_index");
  return data ?? [];
}

async function updatePhase(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const description = formData.get("description") as string;
  const hormone_profile = formData.get("hormone_profile") as string;
  await adminContentClient
    .from("cycle_phases")
    .update({ description, hormone_profile })
    .eq("id", id);
  revalidatePath("/cycle-phases");
}

const ENERGY_LABELS: Record<string, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög",
  variable: "Varierande",
};

const PHASE_COLORS: Record<string, string> = {
  menstruation: "#E57373",
  follikular: "#81C784",
  ovulation: "#FFD54F",
  luteal: "#9575CD",
};

export default async function CyclePhasesPage() {
  const phases = await getPhases();

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Cykelns faser</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Redigera fasernas beskrivning och hormonprofil. Namn, dagar och färg sätts via SQL.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {phases.map((phase: any) => (
          <div
            key={phase.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #f0d6d7",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: PHASE_COLORS[phase.id] + "22",
                borderLeft: `4px solid ${PHASE_COLORS[phase.id] ?? "#888"}`,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: PHASE_COLORS[phase.id] ?? "#888",
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{phase.name}</div>
                <div style={{ fontSize: 12, color: "#976568" }}>
                  {phase.typical_days} · Energi: {ENERGY_LABELS[phase.energy_level] ?? phase.energy_level}
                </div>
              </div>
            </div>
            <form action={updatePhase} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="hidden" name="id" value={phase.id} />
              <div>
                <label style={labelStyle}>Beskrivning</label>
                <textarea
                  name="description"
                  defaultValue={phase.description ?? ""}
                  rows={3}
                  style={textareaStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Hormonprofil</label>
                <textarea
                  name="hormone_profile"
                  defaultValue={phase.hormone_profile ?? ""}
                  rows={2}
                  style={textareaStyle}
                />
              </div>
              <button type="submit" style={btnStyle}>Spara</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#462324",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #f0d6d7",
  fontSize: 14,
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "10px 20px",
  background: "#462324",
  color: "#FEE7AB",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
