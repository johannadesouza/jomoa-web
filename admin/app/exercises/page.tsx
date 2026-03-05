import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";

interface Exercise {
  id: string;
  name: string;
  primary_muscle_group: string | null;
  equipment: string | null;
  default_video_url: string | null;
}

async function getExercises(): Promise<Exercise[]> {
  const { data } = await adminContentClient
    .from("exercises")
    .select("id, name, primary_muscle_group, equipment, default_video_url")
    .order("name");
  return (data ?? []) as Exercise[];
}

async function createExercise(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  await adminContentClient.from("exercises").insert({
    name: name.trim(),
    primary_muscle_group: (formData.get("primary_muscle_group") as string)?.trim() || null,
    equipment: (formData.get("equipment") as string)?.trim() || null,
    default_video_url: (formData.get("default_video_url") as string)?.trim() || null,
  });
  revalidatePath("/exercises");
  redirect("/exercises?saved=1");
}

async function updateExercise(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("exercises").update({
    name: (formData.get("name") as string)?.trim(),
    primary_muscle_group: (formData.get("primary_muscle_group") as string)?.trim() || null,
    equipment: (formData.get("equipment") as string)?.trim() || null,
    default_video_url: (formData.get("default_video_url") as string)?.trim() || null,
  }).eq("id", id);
  revalidatePath("/exercises");
  redirect("/exercises?saved=1");
}

async function deleteExercise(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("exercises").delete().eq("id", id);
  revalidatePath("/exercises");
  redirect("/exercises?saved=1");
}

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const exercises = await getExercises();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1>Övningar ({exercises.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary style={summaryStyle}>+ Ny övning</summary>
        <form action={createExercise} style={formGridStyle}>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Namn *</label>
            <input name="name" required placeholder="T.ex. Marklyft" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Muskelgrupp</label>
            <input name="primary_muscle_group" placeholder="T.ex. Rygg" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Utrustning</label>
            <input name="equipment" placeholder="T.ex. Skivstång" style={inputStyle} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Video URL</label>
            <input name="default_video_url" placeholder="https://..." type="url" style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara övning</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {exercises.map((ex) => (
          <details key={ex.id} style={rowDetailsStyle}>
            <summary style={rowSummaryStyle}>
              <span style={{ fontWeight: 600, flex: 1 }}>{ex.name}</span>
              <span style={{ fontSize: 12, color: "#976568", marginRight: 8 }}>
                {[ex.primary_muscle_group, ex.equipment].filter(Boolean).join(" · ") || "–"}
              </span>
            </summary>
            <div style={{ padding: "16px 16px 16px 20px", background: "#FFFBF7", borderTop: "1px solid #f0d6d7" }}>
              <form action={updateExercise} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 560 }}>
                <input type="hidden" name="id" value={ex.id} />
                <div style={fieldStyle}>
                  <label style={labelStyle}>Namn *</label>
                  <input name="name" defaultValue={ex.name} required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Muskelgrupp</label>
                  <input name="primary_muscle_group" defaultValue={ex.primary_muscle_group ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Utrustning</label>
                  <input name="equipment" defaultValue={ex.equipment ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Video URL</label>
                  <input name="default_video_url" defaultValue={ex.default_video_url ?? ""} type="url" style={inputStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                  <button type="submit" style={saveBtnStyle}>Spara ändringar</button>
                  <ConfirmDeleteButton action={deleteExercise} formData={{ id: ex.id }} style={deleteBtnStyle} />
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
  borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16,
  listStyle: "none",
};
const formGridStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12,
  padding: 24, marginTop: 4, display: "grid",
  gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
};
const rowDetailsStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 8, border: "1px solid #f0d6d7", overflow: "hidden",
};
const rowSummaryStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: "12px 16px",
  cursor: "pointer", gap: 8,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324",
  textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #f0d6d7",
  fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px", background: "transparent", color: "#E57373",
  border: "1px solid #E57373", borderRadius: 8, fontSize: 13, cursor: "pointer",
};
