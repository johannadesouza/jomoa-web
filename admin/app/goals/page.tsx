import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";

interface TrainingGoalRow {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  program_target_goal: string | null;
  order_index: number;
}

async function getGoals(): Promise<TrainingGoalRow[]> {
  const { data } = await adminContentClient
    .from("training_goals")
    .select("*")
    .order("order_index");
  return (data ?? []) as TrainingGoalRow[];
}

async function createGoal(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  if (!id || !label) return;
  await adminContentClient.from("training_goals").insert({
    id,
    label,
    description: (formData.get("description") as string)?.trim() || null,
    icon: (formData.get("icon") as string)?.trim() || null,
    program_target_goal: (formData.get("program_target_goal") as string)?.trim() || null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  });
  revalidatePath("/goals");
}

async function updateGoal(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("training_goals").update({
    label: (formData.get("label") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    icon: (formData.get("icon") as string)?.trim() || null,
    program_target_goal: (formData.get("program_target_goal") as string)?.trim() || null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  }).eq("id", id);
  revalidatePath("/goals");
  redirect("/goals?saved=1");
}

async function deleteGoal(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("training_goals").delete().eq("id", id);
  revalidatePath("/goals");
  redirect("/goals?saved=1");
}

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const goals = await getGoals();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Träningsmål (onboarding)</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Listan används i onboarding och profil. <code>id</code> sparas i <code>clients.primary_goal</code>. <code>program_target_goal</code> matchar <code>training_programs.target_goal</code>.
      </p>

      <details style={{ marginBottom: 24 }}>
        <summary style={summaryStyle}>+ Nytt mål</summary>
        <form action={createGoal} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>id * (t.ex. muscle_growth)</label>
            <input name="id" required placeholder="muscle_growth" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>label *</label>
            <input name="label" required placeholder="Bygga muskler" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>description</label>
            <input name="description" placeholder="Kort beskrivning" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>icon (emoji eller namn)</label>
            <input name="icon" placeholder="💪" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>program_target_goal</label>
            <input name="program_target_goal" placeholder="hypertrophy | strength | general_fitness | endurance" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>order_index</label>
            <input name="order_index" type="number" defaultValue={0} style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {goals.map((g) => (
          <div key={g.id} style={cardStyle}>
            <form action={updateGoal} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="hidden" name="id" value={g.id} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>id</label>
                  <input value={g.id} readOnly style={{ ...inputStyle, background: "#f5f5f5" }} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>label *</label>
                  <input name="label" defaultValue={g.label} required style={inputStyle} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>description</label>
                  <input name="description" defaultValue={g.description ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>icon</label>
                  <input name="icon" defaultValue={g.icon ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>program_target_goal</label>
                  <input name="program_target_goal" defaultValue={g.program_target_goal ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>order_index</label>
                  <input name="order_index" type="number" defaultValue={g.order_index} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" style={saveBtnStyle}>Spara</button>
                <ConfirmDeleteButton action={deleteGoal} formData={{ id: g.id }} style={deleteBtnStyle} />
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

const summaryStyle: React.CSSProperties = {
  cursor: "pointer", display: "inline-block", listStyle: "none",
  padding: "10px 20px", background: "#462324", color: "#FEE7AB",
  borderRadius: 8, fontSize: 14, fontWeight: 600,
};
const formStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12,
  padding: 24, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560,
};
const cardStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 20,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase", letterSpacing: "0.05em",
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
