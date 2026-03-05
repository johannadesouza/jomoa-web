import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface SymptomReliefRow {
  id: string;
  symptom_id: string;
  label: string;
  icon: string | null;
  headline: string;
  tips: string[];
  order_index: number;
}

async function getSymptomRelief(): Promise<SymptomReliefRow[]> {
  const { data } = await adminContentClient
    .from("symptom_relief_tips")
    .select("*")
    .order("symptom_id");
  return (data ?? []) as SymptomReliefRow[];
}

async function updateSymptomRelief(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  const tipsRaw = (formData.get("tips") as string)?.trim();
  const tips = tipsRaw ? tipsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  await adminContentClient.from("symptom_relief_tips").update({
    label: (formData.get("label") as string)?.trim(),
    icon: (formData.get("icon") as string)?.trim() || null,
    headline: (formData.get("headline") as string)?.trim(),
    tips,
  }).eq("id", id);
  revalidatePath("/symptom-relief");
  redirect("/symptom-relief?saved=1");
}

export default async function SymptomReliefPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await getSymptomRelief();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Symtomtips</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Tips per symtom (trötthet, uppblåsthet, energi, sömn). Visas i SymptomReliefCards/SymptomReliefModal.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {rows.map((r) => (
          <div key={r.id} style={cardStyle}>
            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{r.icon ?? "–"}</span>
              <span>{r.symptom_id}</span>
            </div>
            <form action={updateSymptomRelief} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="hidden" name="id" value={r.id} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>label</label>
                  <input name="label" defaultValue={r.label} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>icon (emoji)</label>
                  <input name="icon" defaultValue={r.icon ?? ""} style={inputStyle} />
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>headline</label>
                <input name="headline" defaultValue={r.headline} style={inputStyle} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>tips (en rad per tip)</label>
                <textarea
                  name="tips"
                  defaultValue={r.tips?.join("\n") ?? ""}
                  rows={6}
                  style={textareaStyle}
                  placeholder="En rad per tip"
                />
              </div>
              <button type="submit" style={saveBtnStyle}>Spara</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

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
const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 120,
};
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
