# Notifications System

## Översikt

Notifications-systemet ger real-time notifikationer till både coach och client när viktiga händelser inträffar.

## Implementerat

### 1. UI Components
- ✅ **Coach Notiscenter** (`/coach/notifications`)
- ✅ **Client Notiscenter** (`/client/notifications`)
- ✅ Notification badges i navigation (visar antal olästa)
- ✅ Markera som läst (individuellt och alla)
- ✅ Gruppering: Olästa / Lästa

### 2. Database
- ✅ `notifications` tabell med följande fält:
  - `id` (UUID)
  - `profile_id` (UUID) - vem som ska få notifikationen
  - `type` (TEXT) - typ av notifikation
  - `title` (TEXT) - titel
  - `message` (TEXT) - meddelande
  - `related_entity_type` (TEXT) - typ av relaterad entitet
  - `related_entity_id` (UUID) - ID för relaterad entitet
  - `is_read` (BOOLEAN) - om notifikationen är läst
  - `created_at` (TIMESTAMPTZ)
  - `metadata` (JSONB) - extra data

### 3. Triggers

#### ✅ Trigger 1: Client logs session (notify coach)
**När:** Klient genomför ett pass (status = 'genomfört')
**Vem:** Coach får notifikation
**Typ:** `client_workout_logged`
**Meddelande:** "[Klientnamn] har genomfört passet [Passnamn]"

**Status:** ✅ Implementerad via database trigger

#### ✅ Trigger 2: Readiness missing 2 days (notify coach)
**När:** Klient har inte loggat readiness på 2+ dagar
**Vem:** Coach får notifikation
**Typ:** `readiness_missing`
**Meddelande:** "[Klientnamn] har inte loggat readiness på X dagar"

**Status:** ✅ Implementerad via database function `check_missing_readiness()`
**Anrop:** Kan anropas via API endpoint `/api/notifications/check-missing` (POST)
**Rekommendation:** Sätt upp cron job eller scheduled task som anropar detta dagligen

#### 🟡 Trigger 3: Coach comments on session (notify client)
**När:** Coach lägger till kommentar/not på pass
**Vem:** Client får notifikation
**Typ:** `coach_comment`
**Meddelande:** "[Coachnamn] har lagt till en kommentar på passet [Passnamn]"

**Status:** 🟡 Funktion skapad, men kräver att `workout_sessions_log.notes` fält finns
**Nästa steg:** 
- Lägg till `notes` fält i `workout_sessions_log` tabell om det inte finns
- Aktivera trigger: `CREATE TRIGGER trigger_coach_comment_on_session...`

## Hook: useNotifications

```typescript
import { useNotifications } from "@/hooks/useNotifications";

const { unreadCount, loading, refetch } = useNotifications();
```

- Hämtar automatiskt antal olästa notifikationer
- Pollar var 30:e sekund för nya notifikationer
- Kan anropas manuellt med `refetch()`

## Notification Types

### Coach
- `client_workout_logged` - Klient har loggat pass
- `readiness_missing` - Klient har inte loggat readiness

### Client
- `coach_comment` - Coach har kommenterat pass
- `program_updated` - Program har uppdaterats (framtida)
- `readiness_reminder` - Påminnelse att logga readiness (framtida)

## API Endpoints

### POST `/api/notifications/check-missing`
Kontrollerar om klienter saknar readiness och skapar notifikationer för coacher.

**Användning:**
- Anropas periodiskt (t.ex. dagligen via cron)
- Kräver `SUPABASE_SERVICE_ROLE_KEY` i environment variables

**Exempel (cron job):**
```bash
# Kör varje dag kl 09:00
0 9 * * * curl -X POST https://your-domain.com/api/notifications/check-missing
```

## Database Functions

### `create_notification()`
Skapar en notifikation.

```sql
SELECT create_notification(
  p_profile_id := 'uuid',
  p_type := 'client_workout_logged',
  p_title := 'Klient har loggat pass',
  p_message := 'Meddelande här',
  p_related_entity_type := 'workout_session_log',
  p_related_entity_id := 'uuid',
  p_metadata := '{"key": "value"}'::jsonb
);
```

### `check_missing_readiness()`
Kontrollerar saknad readiness och skapar notifikationer.

```sql
SELECT check_missing_readiness();
```

## Nästa Steg

1. **Aktivera coach comment trigger:**
   - Lägg till `notes` fält i `workout_sessions_log` om det saknas
   - Aktivera trigger i migration-filen

2. **Sätt upp scheduled task:**
   - Konfigurera cron job eller Vercel Cron för att anropa `/api/notifications/check-missing` dagligen

3. **Framtida förbättringar:**
   - Push notifications (web push)
   - Email notifications
   - Real-time updates (Supabase Realtime)
   - Notification preferences (användare kan välja vilka notifikationer de vill få)

## Testing

### Testa triggers manuellt:

1. **Client logs session:**
   - Logga in som client
   - Genomför ett pass
   - Logga in som coach
   - Kontrollera att notifikation visas i Notiscenter

2. **Readiness missing:**
   - Logga in som client
   - Vänta 2+ dagar utan att logga readiness
   - Anropa `/api/notifications/check-missing`
   - Logga in som coach
   - Kontrollera att notifikation visas

3. **Coach comment:**
   - Logga in som coach
   - Lägg till kommentar på klientens pass (när fältet finns)
   - Logga in som client
   - Kontrollera att notifikation visas

