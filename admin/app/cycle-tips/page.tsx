import { adminContentClient } from "../../lib/contentClient";
import { revalidatePath } from "next/cache";

async function getTips() {
  const { data: phases } = await adminContentClient
    .from("cycle_phases")
    .select("id, name, color_hex")
    .order("order_index");

  const { data: trainingTips } = await adminContentClient
    .from("phase_training_tips")
    .select("*")
    .order("order_index");

  const { data: wellnessTips } = await adminContentClient
    .from("phase_wellness_tips")
    .select("*")
    .order("order_index");

  return { phases: phases ?? [], trainingTips: trainingTips ?? [], wellnessTips: wellnessTips ?? [] };
}

async function addTrainingTip(formData: FormData) {
  "use server";
  await adminContentClient.from("phase_training_tips").insert({
    phase_id: formData.get("phase_id"),
    title: formData.get("title"),
    body: formData.get("body"),
    intensity: formData.get("intensity") || null,
    tip_type: formData.get("tip_type") || null,
  });
  revalidatePath("/cycle-tips");
}

async function deleteTrainingTip(formData: FormData) {
  "use server";
  await adminContentClient.from("phase_training_tips").delete().eq("id", formData.get("id"));
  revalidatePath("/cycle-tips");
}

async function addWellnessTip(formData: FormData) {
  "use server";
  await adminContentClient.from("phase_wellness_tips").insert({
    phase_id: formData.get("phase_id"),
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category") || null,
  });
  revalidatePath("/cycle-tips");
}

async function deleteWellnessTip(formData: FormData) {
  "use server";
  await adminContentClient.from("phase_wellness_tips").delete().eq("id", formData.get("id"));
  revalidatePath("/cycle-tips");
}

const PHASE_COLORS: Record<string, string> = {
  menstruation: "#E57373",
  follikular: "#81C784",
  ovulation: "#FFD54F",
  luteal: "#9575CD",
};

export default async function CycleTipsPage() {
  const { phases, trainingTips, wellnessTips } = await getTips();

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Cykeltips</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Hantera träningsrekommendationer och välmåendetips per fas.
      </p>

      {phases.map((phase: any) => {
        const phaseTrain = trainingTips.filter((t: any) => t.phase_id === phase.id);
        const phaseWell = wellnessTips.filter((t: any) => t.phase_id === phase.id);
        const color = PHASE_COLORS[phase.id] ?? "#888";

        return (
          <div key={phase.id} style={{ marginBottom: 40 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 20, paddingBottom: 10,
              borderBottom: `2px solid ${color}`,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: color }} />
              <h2 style={{ margin: 0, fontSize: 18 }}>{phase.name}</h2>
            </div>

            {/* Träningsrekommendationer */}
            <h3 style={{ fontSize: 14, color: "#462324", marginBottom: 12 }}>Träning ({phaseTrain.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {phaseTrain.map((tip: any) => (
                <div key={tip.id} style={tipRowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: "#976568", marginTop: 2 }}>{tip.body}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                      {tip.tip_type} · {tip.intensity}
                    </div>
                  </div>
                  <form action={deleteTrainingTip}>
                    <input type="hidden" name="id" value={tip.id} />
                    <button type="submit" style={deleteBtnStyle}>Ta bort</button>
                  </form>
                </div>
              ))}
            </div>
            <form action={addTrainingTip} style={addFormStyle}>
              <input type="hidden" name="phase_id" value={phase.id} />
              <input name="title" placeholder="Titel" required style={inputStyle} />
              <textarea name="body" placeholder="Beskrivning" rows={2} required style={{ ...inputStyle, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <select name="tip_type" style={selectStyle}>
                  <option value="recommendation">Rekommendation</option>
                  <option value="warning">Varning</option>
                  <option value="motivation">Motivation</option>
                </select>
                <select name="intensity" style={selectStyle}>
                  <option value="light">Lätt</option>
                  <option value="moderate">Måttlig</option>
                  <option value="high">Hög</option>
                </select>
              </div>
              <button type="submit" style={addBtnStyle}>+ Lägg till träningsrekommendation</button>
            </form>

            {/* Välmåendetips */}
            <h3 style={{ fontSize: 14, color: "#462324", marginBottom: 12, marginTop: 24 }}>Välmående ({phaseWell.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {phaseWell.map((tip: any) => (
                <div key={tip.id} style={tipRowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: "#976568", marginTop: 2 }}>{tip.body}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{tip.category}</div>
                  </div>
                  <form action={deleteWellnessTip}>
                    <input type="hidden" name="id" value={tip.id} />
                    <button type="submit" style={deleteBtnStyle}>Ta bort</button>
                  </form>
                </div>
              ))}
            </div>
            <form action={addWellnessTip} style={addFormStyle}>
              <input type="hidden" name="phase_id" value={phase.id} />
              <input name="title" placeholder="Titel" required style={inputStyle} />
              <textarea name="body" placeholder="Beskrivning" rows={2} required style={{ ...inputStyle, resize: "vertical" }} />
              <select name="category" style={selectStyle}>
                <option value="nutrition">Nutrition</option>
                <option value="sleep">Sömn</option>
                <option value="stress">Stress</option>
                <option value="symptoms">Symtom</option>
                <option value="mindfulness">Mindfulness</option>
              </select>
              <button type="submit" style={addBtnStyle}>+ Lägg till välmåendetips</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}

const tipRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 16px",
  background: "#fff",
  borderRadius: 8,
  border: "1px solid #f0d6d7",
};

const addFormStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "16px",
  background: "#FFFBF7",
  borderRadius: 8,
  border: "1px dashed #f0d6d7",
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

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #f0d6d7",
  fontSize: 14,
  fontFamily: "inherit",
  flex: 1,
};

const addBtnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "8px 16px",
  background: "#462324",
  color: "#FEE7AB",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "transparent",
  color: "#E57373",
  border: "1px solid #E57373",
  borderRadius: 6,
  fontSize: 12,
  cursor: "pointer",
};
