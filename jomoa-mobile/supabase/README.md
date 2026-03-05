# JOMOA Mobile – Supabase (User DB)

## Migrations

User DB-schema körs mot samma Supabase-projekt som mobilappen använder för persondata.

- **I denna mapp:** `migrations/001_jomoa_training_schema.sql`, `002_jomoa_rls.sql`, och senare numrerade filer – kör i filordning.
- **Cycle engine:** Tabellerna `cycles`, `cycle_stats`, `user_cycle_settings` skapas via `supabase/user/migrations/003_cycle_engine.sql` (i monorepots `supabase/user/`).

```bash
# Med Supabase CLI (mot User DB-projektet)
supabase db push

# Eller kör SQL-filerna manuellt i Supabase Dashboard i nummerordning.
```

## Förutsättningar

- Supabase-projekt med Auth aktiverat; `auth.users` finns.

## Seed

- `seed.sql` i denna mapp – exempeldata för cykel, readiness, pass.
- Program och övningar kommer från **Content DB**; User DB innehåller endast persondata och loggar.

## Schema

Se [docs/SCHEMA_REFERENCE.md](../docs/SCHEMA_REFERENCE.md) för tabellreferens.
