# JOMOA Branding Guide v1.0 - Launch Version

## Overview
This document outlines the complete branding system for JOMOA as implemented across both `jomoa.coach/web` and `jomoa.coach/jomoa-app`.

## 1. Brand Positioning

**JOMOA** is a strategic training app for women who want stable, intelligent progression.

**Core**: Data-driven training adapted to menstrual cycle, energy, and real life.

**JOMOA is NOT**:
- A period app
- An influencer-driven fitness platform
- A spiritual wellness app
- An aggressive gym culture

**Feeling**: Smart. Calm. Premium. Structured. Modern.

## 2. Visual Identity

### Color System

#### Primary Colors
- **Deep Plum Black** `#141012` - Primary Background (70% of design)
- **Warm Charcoal** `#1E1A1C` - Secondary Background (20% of design)
- **Warm Terracotta** `#D96D46` - Primary Accent (10% of design)
  - Used for: CTA buttons, active states, progress indicators

#### Text Colors
- **Soft Light** `#EDE8E6` - Primary Text
- **Muted Warm** `#8A7F7A` - Secondary Text

### Color Principles
- **70%** dark base (Deep Plum Black)
- **20%** neutral tones (Warm Charcoal)
- **10%** accent (Warm Terracotta)
- **No gradients**
- **No bright blue tech colors**
- **No neon**

### Tailwind Classes
```css
bg-deep-plum-black    /* Primary background */
bg-warm-charcoal      /* Secondary background */
bg-warm-terracotta    /* Accent/CTA */
text-soft-light       /* Primary text */
text-muted-warm       /* Secondary text */
```

## 3. Typography

### Primary Font (UI & Body Text)
**Inter** - Regular (400), Medium (500), Semibold (600)
- Clean, modern, functional
- Used for: UI elements, body text, buttons, labels

### Secondary Font (Headings & Hero)
**Cormorant** - Regular (400), Medium (500), Semibold (600)
- Elegant serif
- Used sparingly: H1, slogans, key headlines
- Max 15% of total text area

### Typography Hierarchy
- **H1** – Cormorant, 34px, line-height: 1.25
- **H2** – Inter Semibold, line-height: 1.25
- **Body** – Inter Regular, line-height: 1.35
- **Small** – Inter Medium, line-height: 1.35

### Tailwind Classes
```css
font-inter      /* UI & body text */
font-cormorant  /* Headings */
```

## 4. UI Principles

The app should feel: **Calm. Structured. Premium. Intelligent.**

### Layout
- Generous spacing (12-16px border radius)
- Minimal use of shadows
- Subtle dividers
- Clean, structured layouts

### Buttons
- Filled terracotta background
- White/Soft Light text
- Rounded corners (12-16px)
- No gradients
- Clear but discrete

### Charts & Data
- Thin lines
- Subtle markings
- Focus on readability
- No excessive animations

## 5. Tone of Voice

**Language Principle**: Short. Factual. Intelligent. Calm.

### Examples
- "Behåll progression." (Keep progression)
- "Justera istället för att pausa." (Adjust instead of pausing)
- "Data som hjälper dig fatta bättre beslut." (Data that helps you make better decisions)
- "Stabil utveckling över tid." (Stable development over time)

### Avoid
- Maxa (Max out)
- Crush
- Glow
- Feminine energy
- Vibes

## 6. Image Style

Images should be:
- Dark but softly lit
- Natural and authentic
- Focus on movement and function
- Discrete, clean, body-close

Avoid:
- Raw, aggressive gym aesthetics
- Influencer selfies
- Excessive fitness posing
- Pastel wellness environments

The aesthetic should feel modern, thoughtful, and subtly premium – more studio and natural light than hard gym environment.

## 7. App Store Positioning

### App Name
**JOMOA – Träningsapp för kvinnor**

### Subtitle
**Datadriven & cykelanpassad**

### Screenshot Texts
- "Träningsapp för kvinnor som vill ha progression"
- "Anpassar träningen efter din cykel"
- "Logga styrka. Följ utveckling."
- "Justera istället för att börja om"
- "Datadriven struktur. Ingen gissning."

## 8. Beta Position

Launch as: **JOMOA Beta – Founding Members**

**Communication**: "Du är med och formar framtidens träningsapp för kvinnor." (You are helping shape the future training app for women.)

**Purpose**:
- Gather quality feedback
- Improve retention
- Build engaged core group

## 9. Core Principle

**Results through adjustment – not through rigidity.**

It's discipline without ignoring biology. It's progression without restart.

## Implementation Status

### ✅ Completed
- [x] Updated `jomoa-app/tailwind.config.ts` with new branding colors
- [x] Updated `jomoa-app/styles/globals.css` with dark theme and typography
- [x] Updated `jomoa-app/app/layout.tsx` with Inter and Cormorant fonts
- [x] Updated `web/app/globals.css` with new branding
- [x] Updated `web/app/layout.tsx` with Inter and Cormorant fonts
- [x] Updated `jomoa-app/components/ui/Button.tsx` with new colors
- [x] Updated `web/app/[locale]/HomeClient.tsx` color definitions

### 🔄 In Progress / To Do
- [ ] Update hardcoded color values in components (gradual migration)
- [ ] Update all components to use new Tailwind classes
- [ ] Review and update image assets to match new aesthetic
- [ ] Update App Store metadata and screenshots
- [ ] Test dark theme across all pages
- [ ] Update documentation and style guides

## Migration Notes

### Legacy Colors (Backward Compatibility)
The following legacy colors are still available during the transition:
- `soft-pink`, `terracotta`, `sand`, `plum`, `mauve`
- `sage`, `cream`
- `league-spartan`, `the-seasons` fonts

These should be gradually replaced with the new branding colors.

### Color Migration Map
| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `#5A6B5D` (sage) | `#141012` (deep-plum-black) | Backgrounds |
| `#FEFCF8` (cream) | `#EDE8E6` (soft-light) | Text |
| `#8B6F47` (accent) | `#D96D46` (warm-terracotta) | CTAs, accents |
| `#462324` (plum) | `#EDE8E6` (soft-light) | Headlines |

## Files Modified

### jomoa-app/
- `tailwind.config.ts` - New color system and typography
- `styles/globals.css` - Dark theme, typography hierarchy
- `app/layout.tsx` - Font imports (Inter, Cormorant)
- `components/ui/Button.tsx` - New color scheme

### web/
- `app/globals.css` - New branding colors and dark theme
- `app/layout.tsx` - Font imports (Inter, Cormorant)
- `app/[locale]/HomeClient.tsx` - Updated color definitions

## Next Steps

1. **Component Updates**: Systematically update components to use new Tailwind classes
2. **Image Assets**: Update or replace images to match new aesthetic
3. **Testing**: Test dark theme across all pages and components
4. **Documentation**: Update component library and style guide
5. **App Store**: Update metadata, screenshots, and descriptions

---

**Last Updated**: 2025-01-20
**Version**: 1.0 - Launch Version

