import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface OnboardingCopyRow {
  id: string;
  screen: string;
  field_key: string;
  value_sv: string;
  value_en: string | null;
}

async function getOnboardingCopy(): Promise<OnboardingCopyRow[]> {
  const { data } = await adminContentClient
    .from("onboarding_copy")
    .select("*")
    .order("screen")
    .order("field_key");
  return (data ?? []) as OnboardingCopyRow[];
}

async function updateCopy(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("onboarding_copy").update({
    value_sv: (formData.get("value_sv") as string)?.trim() ?? "",
    value_en: (formData.get("value_en") as string)?.trim() || null,
  }).eq("id", id);
  revalidatePath("/onboarding-copy");
}

async function createCopy(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const screen = (formData.get("screen") as string)?.trim();
  const field_key = (formData.get("field_key") as string)?.trim();
  const value_sv = (formData.get("value_sv") as string)?.trim();
  if (!id || !screen || !field_key || !value_sv) return;
  await adminContentClient.from("onboarding_copy").insert({
    id,
    screen,
    field_key,
    value_sv,
    value_en: (formData.get("value_en") as string)?.trim() || null,
  });
  revalidatePath("/onboarding-copy");
  redirect("/onboarding-copy?saved=1");
}

const SCREENS = ["path_choice", "goals", "frequency", "training_days", "cycle_setup", "complete"] as const;

export default async function OnboardingCopyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await getOnboardingCopy();
  const byScreen = rows.reduce((acc, r) => {
    if (!acc[r.screen]) acc[r.screen] = [];
    acc[r.screen].push(r);
    return acc;
  }, {} as Record<string, OnboardingCopyRow[]>);

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>Onboarding-texter</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Nyckel–värde per skärm. Mobilen hämtar med <code>fetchOnboardingCopy(locale)</code> och använder <code>id</code> som key (t.ex. path_choice_title).
      </p>

      <details style={{ marginBottom: 32 }}>
        <summary style={summaryStyle}>+ Ny rad</summary>
        <form action={createCopy} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>id * (t.ex. path_choice_title)</label>
            <input name="id" required placeholder="goals_title" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>screen *</label>
            <select name="screen" required style={inputStyle}>
              {SCREENS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>field_key *</label>
            <input name="field_key" required placeholder="title" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>value_sv *</label>
            <input name="value_sv" required placeholder="Svensk text" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>value_en</label>
            <input name="value_en" placeholder="English text" style={inputStyle} />
          </div>
          <button type="submit" style={saveBtnStyle}>Spara</button>
        </form>
      </details>

      {SCREENS.map((screen) => (
        <div key={screen} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#462324", marginBottom: 12 }}>{screen}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(byScreen[screen] ?? []).map((r) => (
              <form key={r.id} action={updateCopy} style={rowStyle}>
                <input type="hidden" name="id" value={r.id} />
                <span style={{ flex: "0 0 180px", fontSize: 13, color: "#976568" }}>{r.id}</span>
                <input name="value_sv" defaultValue={r.value_sv} style={inputStyle} placeholder="SV" />
                <input name="value_en" defaultValue={r.value_en ?? ""} style={inputStyle} placeholder="EN" />
                <button type="submit" style={smallBtnStyle}>Spara</button>
              </form>
            ))}
            {(!byScreen[screen] || byScreen[screen].length === 0) && (
              <span style={{ fontSize: 13, color: "#976568" }}>Inga rader för denna skärm.</span>
            )}
          </div>
        </div>
      ))}
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
const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
  padding: "10px 12px", background: "#fff", border: "1px solid #f0d6d7", borderRadius: 8,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #f0d6d7",
  fontSize: 14, fontFamily: "inherit", flex: "1 1 200px", minWidth: 0, boxSizing: "border-box",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const smallBtnStyle: React.CSSProperties = {
  padding: "6px 14px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
};
