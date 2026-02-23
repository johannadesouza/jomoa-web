# JOMOA Mobile – Supabase

## Migrations

Kör migrations i ordning (se `MIGRATION_ORDER.txt`):

```bash
# Med Supabase CLI (från projektroten)
supabase db push

# Eller manuellt i Supabase Dashboard SQL Editor
# 1. Kör 001_jomoa_training_schema.sql
# 2. Kör 002_jomoa_rls.sql
```

## Förutsättningar

- Supabase-projekt med Auth aktiverat
- `auth.users` finns

## Seed

Tabellerna `training_programs`, `program_blocks`, `program_weeks`, `program_sessions`, `session_exercises` och `exercises` måste fyllas med template-program och övningar. Detta görs vanligtvis via ett separat seed-script eller Supabase Dashboard.

## Schema

Se [docs/SCHEMA_REFERENCE.md](../docs/SCHEMA_REFERENCE.md) för fullständig dokumentation.
