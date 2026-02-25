import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface Program {
  id: string;
  name: string;
  description: string | null;
  target_goal: string | null;
  target_duration_weeks: number | null;
  is_template: boolean;
}

async function getPrograms(): Promise<Program[]> {
  const { data } = await adminContentClient
    .from("training_programs")
    .select("id, name, description, target_goal, target_duration_weeks, is_template")
    .order("name");
  return (data ?? []) as Program[];
}

async function createProgram(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const target_goal = formData.get("target_goal") as string;
  const weeks = formData.get("target_duration_weeks") as string;

  if (!name?.trim()) return;

  await adminContentClient.from("training_programs").insert({
    name: name.trim(),
    description: description?.trim() || null,
    target_goal: target_goal?.trim() || null,
    target_duration_weeks: weeks ? parseInt(weeks, 10) : null,
    is_template: true,
  });
  revalidatePath("/programs");
}

async function deleteProgram(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("training_programs").delete().eq("id", id);
  revalidatePath("/programs");
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Gå ner i vikt",
  build_muscle: "Bygga muskler",
  improve_fitness: "Förbättra kondition",
  stay_active: "Hålla igång",
  reduce_stress: "Minska stress",
  hormonal_balance: "Hormonell balans",
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <div>
      <h1>Program ({programs.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary className="btn btn-primary" style={{ cursor: "pointer", marginBottom: 16 }}>
          + Nytt program
        </summary>
        <form action={createProgram} style={{
          background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
        }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Namn *</label>
            <input name="name" required placeholder="T.ex. Styrka för nybörjare" />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Beskrivning</label>
            <textarea name="description" rows={3} placeholder="Beskrivning av programmet..." />
          </div>
          <div className="form-group">
            <label>Målgrupp (mål)</label>
            <select name="target_goal">
              <option value="">– Välj mål –</option>
              {Object.entries(GOAL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Antal veckor</label>
            <input name="target_duration_weeks" type="number" min={1} max={52} placeholder="T.ex. 8" />
          </div>
          <button type="submit" className="btn btn-primary">Spara program</button>
        </form>
      </details>

      <table>
        <thead>
          <tr>
            <th>Namn</th>
            <th>Mål</th>
            <th>Veckor</th>
            <th>Template</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {programs.map((p) => (
            <tr key={p.id}>
              <td>
                <a href={`/programs/${p.id}`} style={{ color: "#D96D46", fontWeight: 600 }}>
                  {p.name}
                </a>
              </td>
              <td>{p.target_goal ? (GOAL_LABELS[p.target_goal] ?? p.target_goal) : "–"}</td>
              <td>{p.target_duration_weeks ?? "–"}</td>
              <td>{p.is_template ? "✅" : "–"}</td>
              <td>
                <form action={deleteProgram}>
                  <input type="hidden" name="id" value={p.id} />
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
