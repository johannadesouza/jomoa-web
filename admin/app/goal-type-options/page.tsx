import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";

const GOAL_TYPES = ["fitness", "nutrition", "wellness", "event"] as const;

interface GoalTypeOptionRow {
  goal_type: string;
  option_id: string;
  label: string;
  icon_name: string | null;
  order_index: number;
}

async function getGoalTypeOptions(): Promise<GoalTypeOptionRow[]> {
  const { data } = await adminContentClient
    .from("goal_type_options")
    .select("*")
    .order("goal_type")
    .order("order_index");
  return (data ?? []) as GoalTypeOptionRow[];
}

async function createOption(formData: FormData) {
  "use server";
  const goal_type = (formData.get("goal_type") as string)?.trim();
  const option_id = (formData.get("option_id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  if (!goal_type || !option_id || !label) return;
  await adminContentClient.from("goal_type_options").insert({
    goal_type,
    option_id,
    label,
    icon_name: (formData.get("icon_name") as string)?.trim() || null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  });
  revalidatePath("/goal-type-options");
  redirect("/goal-type-options?saved=1");
}

async function updateOption(formData: FormData) {
  "use server";
  const goal_type = formData.get("goal_type") as string;
  const option_id = formData.get("option_id") as string;
  if (!goal_type || !option_id) return;
  await adminContentClient.from("goal_type_options").update({
    label: (formData.get("label") as string)?.trim(),
    icon_name: (formData.get("icon_name") as string)?.trim() || null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  }).eq("goal_type", goal_type).eq("option_id", option_id);
  revalidatePath("/goal-type-options");
  redirect("/goal-type-options?saved=1");
}

async function deleteOption(formData: FormData) {
  "use server";
  const goal_type = formData.get("goal_type") as string;
  const option_id = formData.get("option_id") as string;
  if (!goal_type || !option_id) return;
  await adminContentClient.from("goal_type_options").delete().eq("goal_type", goal_type).eq("option_id", option_id);
  revalidatePath("/goal-type-options");
  redirect("/goal-type-options?saved=1");
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #f0d6d7",
  borderRadius: 12,
  padding: 20,
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
const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "transparent",
  color: "#E57373",
  border: "1px solid #E57373",
  borderRadius: 8,
  fontSize: 13,
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

export default async function GoalTypeOptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const options = await getGoalTypeOptions();
  const byType = GOAL_TYPES.map((type) => ({
    type,
    items: options.filter((o) => o.goal_type === type),
  }));

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Resans mål (goal_type_options)</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Alternativ i AddGoalModal – fitness, nutrition, wellness, event. Appen hämtar via <code>useGoalTypeOptions</code>.
      </p>

      <details style={{ marginBottom: 24 }}>
        <summary style={summaryStyle}>+ Nytt alternativ</summary>
        <form action={createOption} style={{ background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>goal_type *</label>
            <select name="goal_type" required style={inputStyle}>
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>option_id * (t.ex. strength)</label>
            <input name="option_id" required placeholder="strength" style={inputStyle} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>label *</label>
            <input name="label" required placeholder="Bli starkare" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>icon_name (Ionicons, t.ex. barbell-outline)</label>
            <input name="icon_name" placeholder="barbell-outline" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>order_index</label>
            <input name="order_index" type="number" defaultValue={0} style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={saveBtnStyle}>Spara</button>
          </div>
        </form>
      </details>

      {byType.map(({ type, items }) => (
        <div key={type} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#462324", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {type}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((row) => (
              <div key={`${row.goal_type}-${row.option_id}`} style={cardStyle}>
                <form action={updateOption} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="hidden" name="goal_type" value={row.goal_type} />
                  <input type="hidden" name="option_id" value={row.option_id} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>option_id</label>
                      <input value={row.option_id} readOnly style={{ ...inputStyle, background: "#f5f5f5" }} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>label *</label>
                      <input name="label" defaultValue={row.label} required style={inputStyle} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>icon_name</label>
                      <input name="icon_name" defaultValue={row.icon_name ?? ""} style={inputStyle} />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>order_index</label>
                      <input name="order_index" type="number" defaultValue={row.order_index} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" style={saveBtnStyle}>Spara</button>
                    <ConfirmDeleteButton action={deleteOption} formData={{ goal_type: row.goal_type, option_id: row.option_id }} style={deleteBtnStyle} />
                  </div>
                </form>
              </div>
            ))}
            {items.length === 0 && (
              <p style={{ color: "#976568", fontSize: 13 }}>Inga alternativ ännu för {type}.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
