# Mailchimp Integration Setup Guide

## Översikt

JOMOA använder Mailchimp för att automatiskt hantera e-postprenumerationer från väntelistan. När någon registrerar sig via formuläret läggs de automatiskt till i din Mailchimp-lista.

## Vad du behöver från Mailchimp

För att aktivera Mailchimp-integrationen behöver du följande information:

### 1. Mailchimp API Key
- Gå till: https://mailchimp.com/developer/marketing/api/authentication/
- Eller: Account → Extras → API keys
- Skapa en ny API key om du inte har en
- **Format**: `your-api-key-us1` (eller `us2`, `us3`, etc.)

### 2. Mailchimp List ID (Audience ID)
- Gå till: Audience → All contacts → Settings → Audience name and defaults
- Eller: Audience → Manage Audience → Settings
- Hitta "Audience ID" (ser ut som: `a1b2c3d4e5`)
- Detta är din **List ID**

### 3. Server Prefix (valfritt)
- Detta är vanligtvis den sista delen av din API key efter bindestrecket
- Exempel: Om din API key är `abc123-us1`, är server prefix `us1`
- Om det inte stämmer, hitta din server i Mailchimp-kontot

## Miljövariabler

Lägg till följande i din `.env.local` fil (eller i din hosting-miljö):

```env
# Mailchimp Configuration
MAILCHIMP_API_KEY=your-api-key-us1
MAILCHIMP_LIST_ID=a1b2c3d4e5
MAILCHIMP_SERVER_PREFIX=us1
```

**Viktigt**: 
- Lägg aldrig `.env.local` i git
- Använd miljövariabler i din hosting-plattform (Vercel, Netlify, etc.)

## Hur det fungerar

1. **Användare fyller i formulär** → E-post skickas till `/api/mailchimp`
2. **API route** → Lägger till e-post i Mailchimp med:
   - Status: "subscribed" (eller "pending" för double opt-in)
   - Tags: "waitlist", locale (sv/en), och eventuella extra tags
   - Language: sv eller en baserat på locale
3. **Supabase backup** → E-posten sparas också i Supabase för backup
4. **Success/Error** → Användaren får feedback

## Konfiguration i Mailchimp

### Rekommenderade inställningar:

1. **Double Opt-in** (valfritt men rekommenderat):
   - Gå till: Audience → Settings → List name and defaults
   - Aktivera "Require subscribers to confirm subscription"
   - Om aktiverat, ändra `status: "subscribed"` till `status: "pending"` i `route.ts`

2. **Tags**:
   - Systemet lägger automatiskt till tags: `waitlist`, `sv`/`en`
   - Du kan lägga till fler tags i `WaitlistForm.tsx`

3. **Merge Fields** (valfritt):
   - Om du vill spara locale som merge field:
   - Gå till: Audience → Settings → List fields and |MERGE| tags
   - Skapa ett nytt field: `LANG` (Text)
   - Uppdatera `route.ts` för att inkludera merge_fields

## Testning

1. **Testa API route direkt**:
```bash
curl -X POST http://localhost:3000/api/mailchimp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","locale":"sv"}'
```

2. **Testa via formulär**:
   - Fyll i formuläret på webbplatsen
   - Kontrollera Mailchimp → Audience → All contacts
   - Kontrollera Supabase → waitlist_emails tabell

## Felsökning

### "Mailchimp not configured"
- Kontrollera att alla miljövariabler är satta
- Starta om dev-servern efter att ha lagt till variabler

### "Invalid API key"
- Kontrollera att API key är korrekt
- Kontrollera att server prefix matchar (us1, us2, etc.)

### "Member Exists"
- Detta är normalt om e-posten redan finns
- Systemet behandlar detta som success

### E-post syns inte i Mailchimp
- Kontrollera att List ID är korrekt
- Kontrollera Mailchimp-loggarna för fel
- Om double opt-in är aktiverad, kolla "Pending" i stället för "Subscribed"

## Ytterligare automatisering

Du kan automatisera mer i Mailchimp:

1. **Welcome Emails**: Skapa automatiskt välkomstmeddelande när någon registrerar sig
2. **Segments**: Skapa segment baserat på tags (t.ex. alla med tag "waitlist")
3. **Automation**: Skapa automation-flöden baserat på prenumeration
4. **Webhooks**: Använd Mailchimp webhooks för att synka med andra system

## Support

Om du stöter på problem:
1. Kontrollera Mailchimp API-dokumentation: https://mailchimp.com/developer/
2. Kontrollera server logs för detaljerade felmeddelanden
3. Kontakta support: info@jomoa.coach

