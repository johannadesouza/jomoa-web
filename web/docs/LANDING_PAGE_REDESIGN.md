# Landing page redesign – summary

## Copy and language

- **Removed:** "Biologi", "biologisk", clinical framing. Replaced with body-understanding, real-life variation, continuity, optional menscykel, stress/sleep/recovery.
- **New hero:** "Träning som följer med livet" / "Training that moves with your life". Subheadline: plan, check-in, tydliga beslut.
- **Optional section:** "Förstå hur kroppen svarar (valfritt)" / "Understand how your body responds (optional)" – menscykel, perimenopaus, utebliven mens, stress/sömn/återhämtning. Footer: "Helt valfritt. Appen fungerar fullt ut utan."
- **Features:** Shorter text (~30%); "Menscykel för den som vill" instead of "Biologi som valfritt tillägg".
- **B2B:** Bullet list (årlig licens, platsbaserad; anställda får åtkomst; endast aggregerade mått). Single CTA: "Kontakta oss".
- **CTAs:** Primary "Ladda ner appen", secondary "För företag" (scroll to company section).

## Page structure (current order)

1. **Hero** – Headline, subheadline, two CTAs. No form.
2. **How it works** – 3 steps with screenshot placeholder + text (alternating left/right).
3. **Features** – 6 cards, short copy, single CTA "Ladda ner appen".
4. **Readiness (deeper explanation)** – Readiness intro, default behaviour, vs linear apps. Max width 560px.
5. **Optional body** – "Förstå hur kroppen svarar (valfritt)" with list + footer.
6. **Calendar** – Short block (kalender och liv).
7. **For everyone + steps** – "Är JOMOA för dig?" + 3 steps (unchanged).
8. **B2C block** – För privatpersoner, plans, CTA Ladda ner appen.
9. **B2B / Company** – Dark block (#2A2426), bullets, CTA Kontakta oss.
10. **FAQ** – 3 questions.
11. **Final CTA** – Headline + Ladda ner + subtext.
12. **Waitlist** – Form (unchanged).
13. **Footer** – Unchanged.

## Component changes

- **HeroSection:** No form, no segment chips. Single column, max-w-2xl. Two CTAs only.
- **ScreenshotPlaceholder:** New component. `aspect-[9/19]`, max-h 420px, rounded-2xl. Replace with real `<Image src="/screenshots/step1.png" />` when assets exist.
- **HowItWorksSection:** Alternating layout (image left/right). Each step: ScreenshotPlaceholder + number + title + description.
- **ReadinessSection:** No decorative shapes. Uses `readiness.vsLinear` for "difference from linear apps". Tighter max-width (560px).
- **OptionalBodySection:** Replaces BiologySection. Uses `dict.optionalBody` (heading, intro, items, footer).
- **B2BBlockSection:** Uses `b2bBlock.bullets` array and single mailto CTA. Dark background `#2A2426`, light text.
- **FeaturesSection:** No decorative shapes, no intro paragraph. Simpler cards (border, rounded-xl, icon + title + short description). Max width 320px on description text.
- **WhyJomoaSection:** Removed (content merged into Readiness + Optional body).
- **PageSection:** Default padding increased to `py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32`.
- **FinalCtaSection:** `ctaFooter.trust` only rendered when non-empty.

## Visual improvements

- Increased vertical spacing between sections (PageSection padding).
- Shorter line length: max-w-[560px] or max-w-[320px] on key text blocks.
- Simpler feature cards: no number badge, no hover scale, single border and rounded-xl.
- Decorative shapes (blur circles) removed from Readiness, Optional body, B2B, Features.
- Company block has distinct dark background for clear separation.
- Hero is single-column, less visual noise.
- Divider lines (h-px) removed from several sections for cleaner look.

## Screenshot placement

- **How it works:** Three placeholders, one per step. Each is a `ScreenshotPlaceholder` with `alt` from `howItWorks.stepN.screenshotAlt`.
- **To use real screenshots:** Add images e.g. under `web/public/screenshots/` (e.g. `step1.png`, `step2.png`, `step3.png`). In `HomeClient.tsx`, replace `<ScreenshotPlaceholder alt={...} step={...} />` with:
  ```tsx
  <Image src="/screenshots/step1.png" alt={step.alt} width={280} height={560} className="rounded-2xl mx-auto" />
  ```
- Recommended size: phone aspect ratio (e.g. 9:19), max height 420px in layout.
