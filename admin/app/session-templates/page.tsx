import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface SessionTemplate {
  id: string;
  name: string;
  focus: string;
  description: string | null;
  duration_minutes: number | null;
}

async function getTemplates(): Promise<SessionTemplate[]> {
  const { data } = await adminContentClient
    .from("session_templates")
    .select("id, name, focus, description, duration_minutes")
    .order("name");
  return (data ?? []) as SessionTemplate[];
}

async function createTemplate(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const focus = formData.get("focus") as string;
  const description = formData.get("description") as string;
  const duration = formData.get("duration_minutes") as string;

  if (!name?.trim() || !focus?.trim()) return;

  await adminContentClient.from("session_templates").insert({
    name: name.trim(),
    focus: focus.trim(),
    description: description?.trim() || null,
    duration_minutes: duration ? parseInt(duration, 10) : null,
  });
  revalidatePath("/session-templates");
}

async function deleteTemplate(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("session_templates").delete().eq("id", id);
  revalidatePath("/session-templates");
}

export default async function SessionTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div>
      <h1>Passmallar ({templates.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary className="btn btn-primary" style={{ cursor: "pointer", marginBottom: 16 }}>
          + Ny passmall
        </summary>
        <form action={createTemplate} style={{
          background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
        }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Namn *</label>
            <input name="name" required placeholder="T.ex. Full Body Styrka" />
          </div>
          <div className="form-group">
            <label>Fokus *</label>
            <input name="focus" required placeholder="T.ex. Styrka, Kondition" />
          </div>
          <div className="form-group">
            <label>Längd (min)</label>
            <input name="duration_minutes" type="number" min={5} max={180} placeholder="T.ex. 45" />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Beskrivning</label>
            <textarea name="description" rows={3} placeholder="Beskrivning av passet..." />
          </div>
          <button type="submit" className="btn btn-primary">Spara passmall</button>
        </form>
      </details>

      <table>
        <thead>
          <tr>
            <th>Namn</th>
            <th>Fokus</th>
            <th>Längd</th>
            <th>Beskrivning</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id}>
              <td style={{ fontWeight: 600 }}>{t.name}</td>
              <td>{t.focus}</td>
              <td>{t.duration_minutes ? `${t.duration_minutes} min` : "–"}</td>
              <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.description ?? "–"}
              </td>
              <td>
                <form action={deleteTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{ fontSize: 11, padding: "4px 10px" }}
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
