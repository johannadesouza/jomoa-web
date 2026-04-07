# Release: CTA och miljö

## CTA – "Ladda ner appen"

- **Nu:** Om ni ännu inte är live kan CTA peka till väntelista eller “Contact / early access” (extern tjänst eller separat site).
- **När appen är live:** Länka till:
  - **App Store** (iOS): `https://apps.apple.com/app/jomoa/...` (ersätt med er riktiga URL)
  - **Google Play** (Android): `https://play.google.com/store/apps/details?id=com.jomoa.app` (ersätt med er riktiga package-id URL)

## Miljö och Sentry

- **jomoa-mobile:** Se [jomoa-mobile/docs/TESTFLIGHT_READINESS.md](../jomoa-mobile/docs/TESTFLIGHT_READINESS.md) för krav (EAS, env, Sentry). Sätt `EXPO_PUBLIC_SENTRY_DSN` för produktion; dokumenterat i `.env.example`.

## Feature flags (valfritt)

- **app_config** (User-DB) kan användas för feature flags; appen läser redan via `appConfigService`. Dokumentera nycklar i er interna runbook när ni lägger till fler.
