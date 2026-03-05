# Release: CTA och miljö

## Landningssida – "Ladda ner appen"

- **Nu:** CTA "Ladda ner appen" (B2C) pekar på väntelista (#waitlist) på landningssidan.
- **När appen är live:** Uppdatera så att knappen länkar till:
  - **App Store** (iOS): `https://apps.apple.com/app/jomoa/...` (eller er faktiska URL)
  - **Google Play** (Android): `https://play.google.com/store/apps/details?id=com.jomoa.app` (eller er paket-URL)
- **Implementering:** I web (t.ex. `HomeClient.tsx` eller i18n) – antingen villkorlig länk (om release) eller byt href för PrimaryCTA när ni går live.

## Miljö och Sentry

- **jomoa-mobile:** Se [jomoa-mobile/docs/TESTFLIGHT_READINESS.md](../jomoa-mobile/docs/TESTFLIGHT_READINESS.md) för krav (EAS, env, Sentry). Sätt `EXPO_PUBLIC_SENTRY_DSN` för produktion; dokumenterat i `.env.example`.
- **Web:** Se [web/docs/ENVIRONMENT_VARIABLES.md](../web/docs/ENVIRONMENT_VARIABLES.md) för Vercel och Content DB.

## Feature flags (valfritt)

- **app_config** (User-DB) kan användas för feature flags; appen läser redan via `appConfigService`. Dokumentera nycklar i er interna runbook när ni lägger till fler.
