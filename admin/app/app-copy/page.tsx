import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface AppCopyRow {
  key: string;
  locale: string;
  profile: string;
  value: string;
}

const LOCALES = ["sv", "en"] as const;
const PROFILES = ["male", "female", "neutral"] as const;

async function getAppCopyRows(): Promise<AppCopyRow[]> {
  const { data } = await adminContentClient
    .from("app_copy")
    .select("*")
    .order("key")
    .order("locale")
    .order("profile");
  return (data ?? []) as AppCopyRow[];
}

async function updateRow(formData: FormData) {
  "use server";
  const key = (formData.get("key") as string)?.trim();
  const locale = (formData.get("locale") as string)?.trim();
  const profile = (formData.get("profile") as string)?.trim();
  if (!key || !locale || !profile) return;
  await adminContentClient
    .from("app_copy")
    .update({
      value: (formData.get("value") as string)?.trim() ?? "",
    })
    .eq("key", key)
    .eq("locale", locale)
    .eq("profile", profile);
  revalidatePath("/app-copy");
  redirect("/app-copy?saved=1");
}

async function createRow(formData: FormData) {
  "use server";
  const key = (formData.get("key") as string)?.trim();
  const locale = (formData.get("locale") as string)?.trim();
  const profile = (formData.get("profile") as string)?.trim();
  const value = (formData.get("value") as string)?.trim();
  if (!key || !locale || !profile || value == null) return;
  await adminContentClient.from("app_copy").insert({
    key,
    locale,
    profile,
    value,
  });
  revalidatePath("/app-copy");
  redirect("/app-copy?saved=1");
}

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
const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "10px 12px",
  background: "#fff",
  border: "1px solid #f0d6d7",
  borderRadius: 8,
  marginBottom: 8,
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
  flex: "1 1 200px",
  minWidth: 0,
  boxSizing: "border-box",
};
const smallBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  background: "#462324",
  color: "#FEE7AB",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export default async function AppCopyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const rows = await getAppCopyRows();

  return (
    <div>
      {saved === "1" && (
        <p style={{ marginBottom: 16, padding: "10px 16px", background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, fontSize: 14 }}>
          Sparat!
        </p>
      )}
      <h1 style={{ marginBottom: 8 }}>App-copy (profilvarierande)</h1>
      <p style={{ color: "#976568", marginBottom: 32 }}>
        Nyckel + locale + profil (male/female/neutral). Appen hämtar med <code>fetchAppCopy(locale, presentation_profile)</code>; fallback är profil sedan neutral.
      </p>

      <details style={{ marginBottom: 24 }}>
        <summary style={summaryStyle}>+ Ny rad</summary>
        <form action={createRow} style={{ background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr auto", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>key *</label>
            <input name="key" required placeholder="welcome_subtitle" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>locale *</label>
            <select name="locale" required style={inputStyle}>
              {LOCALES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>profile *</label>
            <select name="profile" required style={inputStyle}>
              {PROFILES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>value *</label>
            <input name="value" required placeholder="Text" style={inputStyle} />
          </div>
          <button type="submit" style={smallBtnStyle}>Spara</button>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r) => (
          <form key={`${r.key}-${r.locale}-${r.profile}`} action={updateRow} style={rowStyle}>
            <input type="hidden" name="key" value={r.key} />
            <input type="hidden" name="locale" value={r.locale} />
            <input type="hidden" name="profile" value={r.profile} />
            <span style={{ flex: "0 0 160px", fontSize: 13, fontFamily: "monospace", color: "#462324" }}>{r.key}</span>
            <span style={{ flex: "0 0 40px", fontSize: 13, color: "#976568" }}>{r.locale}</span>
            <span style={{ flex: "0 0 70px", fontSize: 13, color: "#976568" }}>{r.profile}</span>
            <input name="value" defaultValue={r.value} style={{ ...inputStyle, flex: "1 1 280px" }} placeholder="Värde" />
            <button type="submit" style={smallBtnStyle}>Spara</button>
          </form>
        ))}
        {rows.length === 0 && (
          <span style={{ fontSize: 13, color: "#976568" }}>Inga rader. Kör migration 009_app_copy.sql för seed.</span>
        )}
      </div>
    </div>
  );
}
