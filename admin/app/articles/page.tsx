import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: "draft" | "published" | "archived";
  locale: string;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  const { data } = await adminContentClient
    .from("articles")
    .select("id, title, slug, category, status, locale, reading_time_minutes, published_at, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as Article[];
}

async function createArticle(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const category = formData.get("category") as string;
  const locale = formData.get("locale") as string;

  if (!title?.trim() || !slug?.trim()) return;

  await adminContentClient.from("articles").insert({
    title: title.trim(),
    slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
    content: content?.trim() || null,
    excerpt: excerpt?.trim() || null,
    category: category?.trim() || null,
    locale: locale || "sv",
    status: "draft",
  });
  revalidatePath("/articles");
}

async function publishArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient
    .from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/articles");
}

async function unpublishArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient
    .from("articles")
    .update({ status: "draft", published_at: null })
    .eq("id", id);
  revalidatePath("/articles");
}

async function archiveArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("articles").update({ status: "archived" }).eq("id", id);
  revalidatePath("/articles");
}

async function deleteArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("articles").delete().eq("id", id);
  revalidatePath("/articles");
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status}`}>
      {status === "published" ? "Publicerad" : status === "draft" ? "Utkast" : "Arkiverad"}
    </span>
  );
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");
  const archived = articles.filter((a) => a.status === "archived");

  return (
    <div>
      <h1>Artiklar ({articles.length})</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 13 }}>
        <span><strong>{drafts.length}</strong> utkast</span>
        <span><strong>{published.length}</strong> publicerade</span>
        <span><strong>{archived.length}</strong> arkiverade</span>
      </div>

      <details style={{ marginBottom: 32 }}>
        <summary className="btn btn-primary" style={{ cursor: "pointer", marginBottom: 16 }}>
          + Ny artikel
        </summary>
        <form action={createArticle} style={{
          background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 700,
        }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Titel *</label>
            <input name="title" required placeholder="T.ex. Träning under follikulärfasen" />
          </div>
          <div className="form-group">
            <label>Slug *</label>
            <input name="slug" required placeholder="traning-under-follikularfasen" />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <input name="category" placeholder="T.ex. Träning, Kost, Cykel" />
          </div>
          <div className="form-group">
            <label>Språk</label>
            <select name="locale" defaultValue="sv">
              <option value="sv">Svenska</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Ingress (excerpt)</label>
            <textarea name="excerpt" rows={2} placeholder="Kort sammanfattning..." />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Innehåll (Markdown)</label>
            <textarea name="content" rows={10} placeholder="# Rubrik&#10;&#10;Skriv Markdown-innehåll här..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 12, color: "#976568", marginBottom: 12 }}>
              Artikeln sparas som <strong>Utkast</strong>. Publicera från listan.
            </p>
            <button type="submit" className="btn btn-primary">Spara utkast</button>
          </div>
        </form>
      </details>

      <table>
        <thead>
          <tr>
            <th>Titel</th>
            <th>Kategori</th>
            <th>Språk</th>
            <th>Status</th>
            <th>Lästid</th>
            <th>Publicerad</th>
            <th>Åtgärder</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>
                <a href={`/articles/${a.id}`} style={{ color: "#D96D46", fontWeight: 600 }}>
                  {a.title}
                </a>
                <div style={{ fontSize: 11, color: "#976568" }}>{a.slug}</div>
              </td>
              <td>{a.category ?? "–"}</td>
              <td>{a.locale === "sv" ? "🇸🇪 SV" : "🇬🇧 EN"}</td>
              <td><StatusBadge status={a.status} /></td>
              <td>{a.reading_time_minutes ? `${a.reading_time_minutes} min` : "–"}</td>
              <td style={{ fontSize: 12 }}>
                {a.published_at ? new Date(a.published_at).toLocaleDateString("sv-SE") : "–"}
              </td>
              <td>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.status === "draft" && (
                    <form action={publishArticle} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="btn btn-primary" style={{ fontSize: 11, padding: "4px 10px" }}>
                        Publicera
                      </button>
                    </form>
                  )}
                  {a.status === "published" && (
                    <form action={unpublishArticle} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="btn btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
                        Avpublicera
                      </button>
                    </form>
                  )}
                  {a.status !== "archived" && (
                    <form action={archiveArticle} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="btn btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
                        Arkivera
                      </button>
                    </form>
                  )}
                  <form action={deleteArticle} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="btn btn-danger"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={(e) => { if (!confirm(`Ta bort "${a.title}"?`)) e.preventDefault(); }}
                    >
                      Ta bort
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
