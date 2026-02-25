import { adminContentClient } from "@/lib/contentClient";
import { revalidatePath } from "next/cache";

interface Exercise {
  id: string;
  name: string;
  primary_muscle_group: string | null;
  equipment: string | null;
  default_video_url: string | null;
}

async function getExercises(): Promise<Exercise[]> {
  const { data } = await adminContentClient
    .from("exercises")
    .select("id, name, primary_muscle_group, equipment, default_video_url")
    .order("name");
  return (data ?? []) as Exercise[];
}

async function createExercise(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const muscle = formData.get("primary_muscle_group") as string;
  const equipment = formData.get("equipment") as string;
  const videoUrl = formData.get("default_video_url") as string;

  if (!name?.trim()) return;

  await adminContentClient.from("exercises").insert({
    name: name.trim(),
    primary_muscle_group: muscle?.trim() || null,
    equipment: equipment?.trim() || null,
    default_video_url: videoUrl?.trim() || null,
  });
  revalidatePath("/exercises");
}

async function deleteExercise(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await adminContentClient.from("exercises").delete().eq("id", id);
  revalidatePath("/exercises");
}

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div>
      <h1>Övningar ({exercises.length})</h1>

      <details style={{ marginBottom: 32 }}>
        <summary className="btn btn-primary" style={{ cursor: "pointer", marginBottom: 16 }}>
          + Ny övning
        </summary>
        <form action={createExercise} style={{
          background: "#fff", border: "1px solid #f0d6d7", borderRadius: 12, padding: 24, marginTop: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600,
        }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Namn *</label>
            <input name="name" required placeholder="T.ex. Marklyft" />
          </div>
          <div className="form-group">
            <label>Muskelgrupp</label>
            <input name="primary_muscle_group" placeholder="T.ex. Rygg" />
          </div>
          <div className="form-group">
            <label>Utrustning</label>
            <input name="equipment" placeholder="T.ex. Skivstång" />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Video URL</label>
            <input name="default_video_url" placeholder="https://..." type="url" />
          </div>
          <button type="submit" className="btn btn-primary">Spara övning</button>
        </form>
      </details>

      <table>
        <thead>
          <tr>
            <th>Namn</th>
            <th>Muskelgrupp</th>
            <th>Utrustning</th>
            <th>Video</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex) => (
            <tr key={ex.id}>
              <td style={{ fontWeight: 600 }}>{ex.name}</td>
              <td>{ex.primary_muscle_group ?? "–"}</td>
              <td>{ex.equipment ?? "–"}</td>
              <td>
                {ex.default_video_url ? (
                  <a href={ex.default_video_url} target="_blank" rel="noreferrer" style={{ color: "#D96D46" }}>
                    Video
                  </a>
                ) : "–"}
              </td>
              <td>
                <form action={deleteExercise}>
                  <input type="hidden" name="id" value={ex.id} />
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={(e) => { if (!confirm(`Ta bort "${ex.name}"?`)) e.preventDefault(); }}
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
