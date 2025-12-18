# Logo och Favicon Setup Guide

## Var ska filerna ligga?

### 1. Favicon (webbläsarens ikon)
Lägg filerna i `web/app/` mappen:

- **`favicon.ico`** - Huvudfavicon (32x32 eller 16x16 pixels)
- **`icon.png`** - App icon (180x180 pixels för Apple devices)
- **`icon.svg`** - SVG-version (valfritt, bättre skalbarhet)

**Filstorlekar:**
- `favicon.ico`: 32x32 eller 16x16 pixels
- `icon.png`: 180x180 pixels (för Apple touch icon)
- `icon.svg`: Vektorformat (rekommenderat)

### 2. Logotyper (för header och Open Graph)
Lägg filerna i `web/public/` mappen:

- **`logo.png`** - Huvudlogotyp (rekommenderat: 200x60 pixels eller större)
- **`logo.svg`** - SVG-version (valfritt, bättre kvalitet)
- **`logo-dark.png`** - Mörk variant (om du har en)
- **`logo-light.png`** - Ljus variant (om du har en)

**Filstorlekar:**
- Header logotyp: 150-200px bredd, proportionell höjd
- Open Graph bild: 1200x630 pixels (för social media delning)

### 3. Open Graph bild (för social media)
Lägg i `web/app/` mappen:

- **`opengraph-image.png`** - 1200x630 pixels
- Eller `opengraph-image.jpg`

## Steg-för-steg instruktioner

### Steg 1: Förbered dina bilder

1. **Favicon:**
   - Skapa en 32x32 eller 16x16 pixels ICO-fil
   - Eller använd en PNG och konvertera till ICO
   - Namn: `favicon.ico`

2. **App Icon:**
   - Skapa en 180x180 pixels PNG
   - Namn: `icon.png`

3. **Logotyp:**
   - Skapa en PNG eller SVG med transparent bakgrund
   - Rekommenderad storlek: 200px bredd (höjd proportionell)
   - Namn: `logo.png` eller `logo.svg`

4. **Open Graph bild:**
   - Skapa en 1200x630 pixels bild
   - Inkludera JOMOA logotyp och eventuell text
   - Namn: `opengraph-image.png`

### Steg 2: Ladda upp filerna

1. **Favicon och App Icon:**
   ```
   web/app/favicon.ico
   web/app/icon.png
   ```

2. **Logotyper:**
   ```
   web/public/logo.png
   web/public/logo.svg (valfritt)
   ```

3. **Open Graph:**
   ```
   web/app/opengraph-image.png
   ```

### Steg 3: Verifiera

Efter att du lagt till filerna:
1. Starta om dev-servern: `npm run dev`
2. Kontrollera favicon i webbläsarens flik
3. Kontrollera logotypen i headern
4. Testa social media delning (t.ex. Facebook Debugger)

## Filnamn och format

### Favicon
- ✅ `app/favicon.ico` - Automatiskt detekterad av Next.js
- ✅ `app/icon.png` - Automatiskt detekterad som app icon
- ✅ `app/icon.svg` - Automatiskt detekterad som SVG icon

### Logotyper
- ✅ `public/logo.png` - Används i Header-komponenten
- ✅ `public/logo.svg` - Används om PNG inte finns

### Open Graph
- ✅ `app/opengraph-image.png` - Automatiskt detekterad av Next.js
- ✅ Eller konfigurerad i `layout.tsx` metadata

## Tips

1. **Använd SVG när möjligt** - Bättre kvalitet och skalbarhet
2. **Optimera bilder** - Använd verktyg som TinyPNG eller ImageOptim
3. **Testa på olika enheter** - Favicon ser olika ut på olika plattformar
4. **Kontrollera kontrast** - Logotypen ska synas på både ljus och mörk bakgrund

## Felsökning

### Favicon visas inte
- Kontrollera att filen heter exakt `favicon.ico` och ligger i `app/`
- Rensa webbläsarens cache
- Starta om dev-servern

### Logotyp visas inte
- Kontrollera filvägen i Header-komponenten
- Kontrollera att filen ligger i `public/`
- Kontrollera filnamnet (skiftlägeskänsligt)

### Open Graph bild visas inte
- Kontrollera att filen ligger i `app/`
- Använd Facebook Debugger för att testa
- Vänta några minuter efter uppladdning (cache)

