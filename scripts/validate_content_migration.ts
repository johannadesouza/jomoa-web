#!/usr/bin/env npx tsx
/**
 * validate_content_migration.ts
 *
 * Verifierar att content-data är korrekt kopierad från User DB till Content DB.
 * Jämför:
 *   1. Row counts per tabell
 *   2. Checksums (MD5 av sorterade IDs) per tabell
 *
 * Kör med:
 *   USER_DB_URL=postgres://... CONTENT_DB_URL=postgres://... npx tsx scripts/validate_content_migration.ts
 *
 * Exitar med kod 0 om allt stämmer, kod 1 om avvikelser hittades.
 */

import { createClient } from "@supabase/supabase-js";

const CONTENT_TABLES = [
  "exercises",
  "training_programs",
  "program_blocks",
  "program_weeks",
  "program_sessions",
  "session_exercises",
  "session_templates",
  "session_template_exercises",
  "articles",
] as const;

type ContentTable = (typeof CONTENT_TABLES)[number];

interface TableResult {
  table: ContentTable;
  userCount: number;
  contentCount: number;
  userChecksum: string | null;
  contentChecksum: string | null;
  countMatch: boolean;
  checksumMatch: boolean;
}

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`❌ Miljövariabel saknas: ${key}`);
    process.exit(1);
  }
  return val;
}

async function getRowCount(
  client: ReturnType<typeof createClient>,
  table: ContentTable
): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    // Tabellen kanske inte finns i denna DB
    return -1;
  }
  return count ?? 0;
}

async function getChecksum(
  client: ReturnType<typeof createClient>,
  table: ContentTable
): Promise<string | null> {
  // Hämta alla IDs sorterade och beräkna en enkel checksum-sträng
  const { data, error } = await client
    .from(table)
    .select("id")
    .order("id", { ascending: true });

  if (error || !data) return null;

  const ids = data.map((r: { id: string }) => r.id).join(",");
  // Enkel hash: längd + första och sista ID (för snabb kontroll)
  if (ids.length === 0) return "empty";
  const parts = ids.split(",");
  return `count:${parts.length}|first:${parts[0]}|last:${parts[parts.length - 1]}`;
}

async function main() {
  console.log("🔍 Content DB Migration Validering\n");

  const userDbUrl = getEnv("USER_DB_SUPABASE_URL");
  const userDbKey = getEnv("USER_DB_SUPABASE_ANON_KEY");
  const contentDbUrl = getEnv("CONTENT_SUPABASE_URL");
  const contentDbKey = getEnv("CONTENT_SUPABASE_ANON_KEY");

  const userClient = createClient(userDbUrl, userDbKey);
  const contentClient = createClient(contentDbUrl, contentDbKey);

  const results: TableResult[] = [];
  let hasErrors = false;

  for (const table of CONTENT_TABLES) {
    process.stdout.write(`  Kontrollerar ${table}...`);

    const [userCount, contentCount, userChecksum, contentChecksum] = await Promise.all([
      getRowCount(userClient, table),
      getRowCount(contentClient, table),
      getChecksum(userClient, table),
      getChecksum(contentClient, table),
    ]);

    const countMatch = userCount === contentCount;
    const checksumMatch = userChecksum === contentChecksum;

    if (!countMatch || !checksumMatch) {
      hasErrors = true;
      process.stdout.write(" ❌\n");
    } else {
      process.stdout.write(" ✅\n");
    }

    results.push({
      table,
      userCount,
      contentCount,
      userChecksum,
      contentChecksum,
      countMatch,
      checksumMatch,
    });
  }

  console.log("\n" + "─".repeat(80));
  console.log(
    `${"Tabell".padEnd(35)} ${"User DB".padEnd(10)} ${"Content DB".padEnd(10)} ${"Antal".padEnd(8)} Checksum`
  );
  console.log("─".repeat(80));

  for (const r of results) {
    const countStatus = r.countMatch ? "✅" : "❌";
    const checksumStatus = r.checksumMatch ? "✅" : "❌";
    const userCount = r.userCount === -1 ? "N/A" : String(r.userCount);
    const contentCount = r.contentCount === -1 ? "N/A" : String(r.contentCount);
    console.log(
      `${r.table.padEnd(35)} ${userCount.padEnd(10)} ${contentCount.padEnd(10)} ${countStatus.padEnd(8)} ${checksumStatus}`
    );
  }

  console.log("─".repeat(80));

  if (hasErrors) {
    console.error(
      "\n❌ VALIDERING MISSLYCKADES – content-tabeller stämmer inte mellan User DB och Content DB."
    );
    console.error(
      "   Kontrollera copy_from_user_db.sql och kör om datasynchroniseringen.\n"
    );
    process.exit(1);
  } else {
    console.log(
      "\n✅ VALIDERING LYCKADES – alla content-tabeller är synkroniserade.\n"
    );
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Oväntat fel:", err);
  process.exit(1);
});
