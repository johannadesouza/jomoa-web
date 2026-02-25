import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
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
    .select("id, title, slug, excerpt, content, category, status, locale, reading_time_minutes, published_at, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as Article[];
}

async function createArticle(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  if (!title?.trim() || !slug?.trim()) return;
  await adminContentClient.from("articles").insert({
    title: title.trim(),
    slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
    content: (formData.get("content") as string)?.trim() || null,
    excerpt: (formData.get("excerpt") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || null,
    locale: (formData.get("locale") as string) || "sv",
    status: "draft",
  });
  revalidatePath("/articles");
}

async function updateArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("articles").update({
    title: (formData.get("title") as string)?.trim(),
    slug: (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-"),
    excerpt: (formData.get("excerpt") as string)?.trim() || null,
    content: (formData.get("content") as string)?.trim() || null,
    category: (formData.get("category") as string)?.trim() || null,
    locale: (formData.get("locale") as string) || "sv",
  }).eq("id", id);
  revalidatePath("/articles");
}

async function publishArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/articles");
}

async function unpublishArticle(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("articles")
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

const STATUS_COLORS: Record<string, string> = {
  published: "#4CAF50",
  draft: "#FFB74D",
  archived: "#9E9E9E",
};
const STATUS_LABELS: Record<string, string> = {
  published: "Publicerad",
  draft: "Utkast",
  archived: "Arkiverad",
};

export default async function ArticlesPage() {
  const articles = await getArticles();
  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.filter((a) => a.status === "published");

  return (
    <div>
      <h1>Artiklar ({articles.length})</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 32, fontSize: 13, color: "#976568" }}>
        <span><strong style={{ color: "#462324" }}>{drafts.length}</strong> utkast</span>
        <span><strong style={{ color: "#462324" }}>{published.length}</strong> publicerade</span>
      </div>

      <details style={{ marginBottom: 32 }}>
        <summary style={summaryStyle}>+ Ny artikel</summary>
        <form action={createArticle} style={{ ...formGridStyle, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Titel *</label>
            <input name="title" required placeholder="T.ex. Träning under follikulärfasen" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Slug *</label>
            <input name="slug" required placeholder="traning-under-follikularfasen" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Kategori</label>
            <input name="category" placeholder="T.ex. Träning, Kost, Cykel" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Språk</label>
            <select name="locale" style={inputStyle}>
              <option value="sv">🇸🇪 Svenska</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Ingress</label>
            <textarea name="excerpt" rows={2} placeholder="Kort sammanfattning..." style={textareaStyle} />
          </div>
          <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Innehåll (Markdown)</label>
            <textarea name="content" rows={8} placeholder="# Rubrik&#10;&#10;Skriv Markdown här..." style={textareaStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 12, color: "#976568", marginBottom: 8 }}>Sparas som utkast – publicera från listan.</p>
            <button type="submit" style={saveBtnStyle}>Spara utkast</button>
          </div>
        </form>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {articles.map((a) => (
          <details key={a.id} style={rowDetailsStyle}>
            <summary style={rowSummaryStyle}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                background: STATUS_COLORS[a.status] ?? "#888",
              }} />
              <span style={{ fontWeight: 600, flex: 1 }}>{a.title}</span>
              <span style={{ fontSize: 12, color: "#976568", marginRight: 8 }}>
                {STATUS_LABELS[a.status]} · {a.category ?? "–"} · {a.locale === "sv" ? "🇸🇪" : "🇬🇧"}
              </span>
            </summary>
            <div style={{ padding: "20px", background: "#FFFBF7", borderTop: "1px solid #f0d6d7" }}>
              {/* Status-knappar – ett form per knapp för att undvika nested forms */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {a.status === "draft" && (
                  <form action={publishArticle}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ ...saveBtnStyle, background: "#4CAF50" }}>Publicera</button>
                  </form>
                )}
                {a.status === "published" && (
                  <form action={unpublishArticle}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ ...saveBtnStyle, background: "#FF9800" }}>Avpublicera</button>
                  </form>
                )}
                {a.status !== "archived" && (
                  <form action={archiveArticle}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ ...deleteBtnStyle, color: "#9E9E9E", borderColor: "#9E9E9E" }}>Arkivera</button>
                  </form>
                )}
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" style={deleteBtnStyle}>Ta bort</button>
                </form>
              </div>

              {/* Redigera-formulär */}
              <form action={updateArticle} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 700 }}>
                <input type="hidden" name="id" value={a.id} />
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Titel *</label>
                  <input name="title" defaultValue={a.title} required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Slug</label>
                  <input name="slug" defaultValue={a.slug} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Kategori</label>
                  <input name="category" defaultValue={a.category ?? ""} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Språk</label>
                  <select name="locale" defaultValue={a.locale} style={inputStyle}>
                    <option value="sv">🇸🇪 Svenska</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Ingress</label>
                  <textarea name="excerpt" defaultValue={a.excerpt ?? ""} rows={2} style={textareaStyle} />
                </div>
                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Innehåll (Markdown)</label>
                  <textarea name="content" defaultValue={a.content ?? ""} rows={12} style={textareaStyle} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" style={saveBtnStyle}>Spara ändringar</button>
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
  borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16, listStyle: "none",
};
const formGridStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12,
  padding: 24, marginTop: 4, display: "grid", gap: 16, maxWidth: 700,
};
const rowDetailsStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 8, border: "1px solid #f0d6d7", overflow: "hidden",
};
const rowSummaryStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: "12px 16px", cursor: "pointer", gap: 10,
};
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#462324", textTransform: "uppercase", letterSpacing: "0.05em",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #f0d6d7",
  fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical" } as React.CSSProperties;
const saveBtnStyle: React.CSSProperties = {
  padding: "8px 20px", background: "#462324", color: "#FEE7AB",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px", background: "transparent", color: "#E57373",
  border: "1px solid #E57373", borderRadius: 8, fontSize: 13, cursor: "pointer",
};
