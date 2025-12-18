# Public Assets

Denna mapp innehåller statiska filer som är tillgängliga via URL:en.

## Mappstruktur

- `logos/` - Logotyper och varumärkesfiler
- `icons/` - Ikoner (favicon, app-ikoner, etc.)
- `images/` - Övriga bilder

## Användning

Filer i `public/`-mappen kan refereras direkt från root-URL:en:

```tsx
// Exempel: public/logos/logo.svg
<img src="/logos/logo.svg" alt="Logo" />

// Exempel: public/icons/favicon.ico
<link rel="icon" href="/icons/favicon.ico" />
```

## Rekommenderade filformat

- **Logos**: SVG (för skalbarhet), PNG (med transparent bakgrund)
- **Icons**: SVG, PNG, ICO (för favicon)
- **Images**: JPG, PNG, WebP (för bättre komprimering)

