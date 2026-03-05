import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmDeleteButton } from "../ConfirmDeleteButton";

interface SymptomOptionRow {
  id: string;
  option_type: string;
  option_id: string;
  label: string;
  value: number | null;
  order_index: number;
}

async function getSymptomOptions(type?: string): Promise<SymptomOptionRow[]> {
  let query = adminContentClient.from("symptom_options").select("*").order("order_index");
  if (type) query = query.eq("option_type", type);
  const { data } = await query;
  return (data ?? []) as SymptomOptionRow[];
}

async function createOption(formData: FormData) {
  "use server";
  const option_type = (formData.get("option_type") as string)?.trim();
  const option_id = (formData.get("option_id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  if (!option_type || !option_id || !label) return;
  const valueRaw = (formData.get("value") as string)?.trim();
  await adminContentClient.from("symptom_options").insert({
    option_type,
    option_id,
    label,
    value: valueRaw ? parseInt(valueRaw, 10) : null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  });
  revalidatePath("/symptom-options");
}

async function updateOption(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  const valueRaw = (formData.get("value") as string)?.trim();
  await adminContentClient.from("symptom_options").update({
    label: (formData.get("label") as string)?.trim(),
    value: valueRaw ? parseInt(valueRaw, 10) : null,
    order_index: parseInt((formData.get("order_index") as string) || "0", 10),
  }).eq("id", id);
  revalidatePath("/symptom-options");
  redirect("/symptom-options?saved=1");
}

async function deleteOption(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("symptom_options").delete().eq("id", id);
  revalidatePath("/symptom-options");
  redirect("/symptom-options?saved=1");
}

const OPTION_TYPES = ["mood", "cravings", "bleeding"] as const;

export default async function SymptomOptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; saved?: string }>;
}) {
  const { type: filterType, saved } = await searchParams;
  const options = await getSymptomOptions(filterType || undefined);

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Symtomalternativ</h1>
      <p style={{ color: "#976568", marginBottom: 24 }}>
        Mood, cravings och bleeding – används i cykellogg (CycleScreen).
      </p>

      <div style={{ marginBottom: 24, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#462324" }}>Filtrera:</span>
        <a href="/symptom-options" style={filterLinkStyle}>Alla</a>
        {OPTION_TYPES.map((t) => (
          <a key={t} href={`/symptom-options?type=${t}`} style={filterType === t ? { ...filterLinkStyle, fontWeight: 700 } : filterLinkStyle}>
            {t}
          </a>
        ))}
      </div>

      <details style={{ marginBottom: 24 }}>
        <summary style={summaryStyle}>+ Nytt alternativ</summary>
        <form action={createOption} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>option_type *</label>
            <select name="option_type" required style={inputStyle}>
              {OPTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>option_id *</label>
            <input name="option_id" required placeholder="t.ex. bra, 1" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>label *</label>
            <input name="label" required placeholder="Bra" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>value (bleeding 1–5, annars tom)</label>
            <input name="value" type="number" placeholder="1" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>order_index</label>
            <input name="order_index" type="number" defaultValue={0} style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara</button>
        </form>
      </details>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #f0d6d7" }}>
        <thead>
          <tr style={{ background: "#f8f0ef", textAlign: "left" }}>
            <th style={thStyle}>type</th>
            <th style={thStyle}>option_id</th>
            <th style={thStyle}>label</th>
            <th style={thStyle}>value</th>
            <th style={thStyle}>order</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => (
            <tr key={o.id} style={{ borderTop: "1px solid #f0d6d7" }}>
              <td style={tdStyle}>{o.option_type}</td>
              <td style={tdStyle}>{o.option_id}</td>
              <td style={tdStyle}>
                <form action={updateOption} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="id" value={o.id} />
                  <input name="label" defaultValue={o.label} style={{ ...inputStyle, width: 140 }} />
                  <input name="value" defaultValue={o.value ?? ""} style={{ ...inputStyle, width: 56 }} placeholder="–" />
                  <input type="hidden" name="order_index" value={o.order_index} />
                  <button type="submit" style={smallBtnStyle}>Spara</button>
                </form>
              </td>
              <td style={tdStyle}>{o.value ?? "–"}</td>
              <td style={tdStyle}>{o.order_index}</td>
              <td style={tdStyle}>
                <ConfirmDeleteButton action={deleteOption} formData={{ id: o.id }} style={deleteBtnStyle} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  padding: 24, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 480,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #f0d6d7",
  fontSize: 14, fontFamily: "inherit", boxSizing: "border-box",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "4px 10px", background: "transparent", color: "#E57373",
  border: "1px solid #E57373", borderRadius: 6, fontSize: 12, cursor: "pointer",
};
const smallBtnStyle: React.CSSProperties = {
  padding: "4px 10px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
};
const filterLinkStyle: React.CSSProperties = {
  color: "#462324", padding: "6px 12px", borderRadius: 8, background: "#f8f0ef",
  textDecoration: "none", fontSize: 13,
};
const thStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase" };
const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: 14, verticalAlign: "middle" };
