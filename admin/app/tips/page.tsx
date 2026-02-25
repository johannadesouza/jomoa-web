import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface Tip {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  tags: string[];
  locale: string;
  status: string;
  created_at: string;
}

async function getTips(): Promise<Tip[]> {
  const { data } = await adminContentClient
    .from("tips_library")
    .select("id, title, body, category, tags, locale, status, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as Tip[];
}

async function createTip(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const category = formData.get("category") as string;
  const tagsRaw = formData.get("tags") as string;
  const locale = formData.get("locale") as string;

  if (!title?.trim()) return;

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await adminContentClient.from("tips_library").insert({
    title: title.trim(),
    body: body?.trim() || null,
    category: category?.trim() || null,
    tags,
    locale: locale || "sv",
    status: "published",
  });
  revalidatePath("/tips");
}

async function deleteTip(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("tips_library").delete().eq("id", id);
  revalidatePath("/tips");
}

export default async function TipsPage() {
  const tips = await getTips();

  return (
    <div>
      <h1>Tips ({tips.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary className="btn btn-primary" style={{ cursor: "pointer", marginBottom: 16 }}>
          + Nytt tips
        </summary>
        <form action={createTip} style={{
          background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
        }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Titel *</label>
            <input name="title" required placeholder="T.ex. Vila under menstruationen" />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <input name="category" placeholder="T.ex. Återhämtning, Nutrition" />
          </div>
          <div className="form-group">
            <label>Språk</label>
            <select name="locale" defaultValue="sv">
              <option value="sv">Svenska</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Tags (kommaseparerade)</label>
            <input name="tags" placeholder="T.ex. cykel, träning, återhämtning" />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Innehåll</label>
            <textarea name="body" rows={4} placeholder="Tipsets innehåll..." />
          </div>
          <button type="submit" className="btn btn-primary">Spara tips</button>
        </form>
      </details>

      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Kategori</th>
            <th>Tags</th>
            <th>Språk</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tips.map((t) => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>{t.title}</td>
              <td>{t.category ?? "–"}</td>
              <td style={{ fontSize: 11 }}>{t.tags?.join(", ") || "–"}</td>
              <td>{t.locale === "sv" ? "🇸🇪" : "🇬🇧"}</td>
              <td>
                <span className={`badge badge-${t.status}`}>
                  {t.status === "published" ? "Publicerat" : t.status}
                </span>
              </td>
              <td>
                <form action={deleteTip}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={(e) => { if (!confirm(`Ta bort "${t.title}"?`)) e.preventDefault(); }}
                  >
                    Ta bort
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
