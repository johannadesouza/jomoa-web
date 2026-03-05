# Finslipningsplan – kön, tema & menscykel

Plan för att använda `presentation_profile`, `presentation_theme` och menscykelval i hela produkten. Ett steg i taget, PR-vänligt.

---

## Förutsättningar (klart)

- **Onboarding:** Kön (man/kvinna/annat) → Tema (kraftfull/ljusare/neutral) → "Har du menscykel?" (ja/nej) → Path/Goals/CycleSetup → Complete.
- **DB:** `clients.presentation_profile`, `clients.presentation_theme` med defaults.
- **Client-typ:** `presentation_profile`, `presentation_theme` i AuthContext.

---

## Steg 1: Presentation theme i tema (färger/ton)

**Mål:** Valet "Kraftfull & tydlig" / "Ljusare & mjukare" / "Neutral" ska påverka färger och känsla i appen.

**Åtgärder:**
- [x] `getThemeColors(themeMode, presentationTheme?)` – andra argumentet optional, default `'neutral'`. (Klart)
- [x] Definiera små varianter för bold/soft/neutral (t.ex. accent styrka, kontrast, bakgrundston). (Klart)
- [x] Ny hook `useThemeColors()` som använder `client.presentation_theme ?? 'neutral'` och returnerar `getThemeColors(theme, presentationTheme)`. (Klart)
- [x] Byta ut `getThemeColors(theme)` mot `useThemeColors()` på nyckelsställen (RootNavigator, TabNavigator, OnboardingNavigator) så att temat faktiskt används. (Klart)
- [x] Övriga komponenter kan bytas gradvis; utan client/presentation_theme används neutral.

**Filer:** `shared/theme/colors.ts`, ny `shared/theme/useThemeColors.ts` (eller i ThemeContext), RootNavigator, TabNavigator, OnboardingNavigator.

---

## Steg 2: Copy-lager med presentation_profile

**Mål:** Texter ska kunna skilja sig åt för man/kvinna/annat (och eventuellt tema) utan hårdkodade strängar.

**Åtgärder:**
- [ ] Skapa `getCopy({ presentation_profile, presentation_theme?, key, context? })` (eller utöka befintlig copy-hook) som returnerar rätt sträng utifrån profil/tema.
- [ ] Content-källa: antingen Content DB (ny tabell eller befintlig onboarding_copy med nycklar) eller lokal map key → { male?, female?, neutral? } med fallback till neutral.
- [ ] Byt ut 2–3 tydliga texter (t.ex. dashboard-rubrik, en insikt, välkomsttext) till copy-lagret så att man/kvinna/annat får olika formuleringar där det är meningsfullt.
- [ ] Dokumentera nyckelkonvention och var copy används.

**Filer:** Ny `lib/copy/` eller utökning av `useOnboardingCopy`, Content DB-migration om copy ska ligga i DB, komponenter som visar profilkänslig copy.

---

## Steg 3: Inställningar – redigera profil & tema

**Mål:** Användaren ska kunna ändra "Hur vi anpassar upplevelsen" (kön) och "Stil" (tema) efter onboarding.

**Åtgärder:**
- [ ] Ny sektion i Settings (eller under "Profil") med två väljare: presentation_profile (Man/Kvinna/Annat) och presentation_theme (Kraftfull/Ljusare/Neutral).
- [ ] Spara till `clients` via supabase update; anropa `refreshClient()` så att hela appen får nya värden.
- [ ] Samma UI-mönster som CycleModeSettingsSection (radio-kort).
- [ ] Eventuellt kort förklaringstext om att program och tips anpassas utifrån valet.

**Filer:** `features/settings/SettingsScreen.tsx`, ny `PresentationSettingsSection.tsx` eller liknande.

---

## Steg 4: Program och tips filtrering på profil

**Mål:** Program och tips ska kunna visas/filtreras utifrån `presentation_profile` (man/kvinna/alla).

**Åtgärder:**
- [ ] **Content DB:** Om ni vill märka innehåll: lägg till `target_profile` (eller liknande) på `training_programs` och ev. tips-tabell (male/female/any). Migration + admin-UI.
- [ ] **App:** Vid hämtning av program/tips: filtrera på `target_profile` = användarens `presentation_profile` ELLER `any`. Om kolumn saknas, visa allt (bakåtkompatibilitet).
- [ ] **Fallback:** Om inga program matchar, visa program märkta "any" eller alla.
- [ ] Samma träningsmotor och logik; bara vilket innehåll som visas.

**Filer:** Content-migration, admin (program/tips), `programService`/repos, skärmar som listar program och tips.

---

## Steg 5: Övningsvideo per presentation_profile

**Mål:** När övningar har olika video-URL för man/kvinna/neutral ska rätt variant visas.

**Åtgärder:**
- [ ] **Content DB (och ev. User DB):** Migration som lägger till `female_video_url`, `male_video_url`, `neutral_video_url` på `exercises` (behåll `default_video_url` som fallback).
- [ ] **App:** Ny util `getExerciseVideoUrl(exercise, presentation_profile)` som returnerar rätt URL (fallback: default_video_url).
- [ ] **WorkoutSessionScreen (och andra som visar övningsvideo):** Använd helper istället för `exercise.default_video_url` direkt.
- [ ] Admin: möjlighet att redigera de nya URL-kolumnerna per övning.

**Filer:** Migration(s), `lib/utils/exerciseMedia.ts` (eller liknande), `WorkoutSessionScreen`, contentRepo exercises, admin exercises-sida.

---

## Steg 6: Dashboard och insikter – profilmedveten copy

**Mål:** Ingen copy som antar "din cykel" när användaren inte har menscykel; ton och formulering ska kunna anpassas efter kön där det är relevant.

**Åtgärder:**
- [ ] **Insikter:** Om användaren har valt "Nej" på menscykel: visa inte cykelfas-specifika insikter; använd readiness-/målbaserade texter (ev. befintliga no_phase_* templates).
- [ ] **Dashboard-rubriker och hero-kort:** Ersätt hårdkodade strängar med copy-lager (steg 2); använd `presentation_profile` så att man/kvinna/annat får lämplig formulering.
- [ ] **CycleHeroCard / PhaseCard:** Dölj eller visa annorlunda när `wantsCycleTracking === false`; undvik "Din cykel" i copy för icke-cykelanvändare.
- [ ] Granska InsightCard, DailyInsight, ExpectAndDoCard m.m. för antaganden om cykel/kön.

**Filer:** DashboardScreen, insightService/insightKeys, CycleHeroCard, PhaseCard, InsightCard, copy-lager.

---

## Steg 7: Onboarding-känsla (tema tidigt, inkluderande copy)

**Mål:** Onboarding ska kännas konsekvent med valt tema och inkluderande för alla.

**Åtgärder:**
- [ ] **Tema redan under onboarding:** Efter val av tema (ThemeScreen) ska nästa steg (CycleQuestion, PathChoice, …) använda samma färg/ton. Det kräver att onboarding har tillgång till `presentation_theme` – t.ex. från OnboardingContext (redan sparat) och att OnboardingNavigator/onboarding-komponenter använder `useThemeColors()` eller getThemeColors med theme från context (om tema ska appliceras innan client finns, kan theme komma från onboarding state).
- [ ] **Copy:** Texterna kring "Har du menscykel?" och ev. "Varför frågar vi" finslipas så de känns inkluderande (alla kön, transinklusive).
- [ ] **Steg-indikator:** Eventuellt uppdatera OnboardingStepDots så att de första stegen (Kön, Tema, Menscykel) syns om ni vill visa total progress.
- [ ] Småjusteringar av rubriker/undertexter på GenderScreen, ThemeScreen, CycleQuestionScreen utifrån feedback.

**Filer:** OnboardingNavigator, GenderScreen, ThemeScreen, CycleQuestionScreen, OnboardingStepDots, ev. copy-lager.

---

## Sammanfattning

| Steg | Fokus | Beroenden |
|------|--------|-----------|
| 1 | Tema (bold/soft/neutral) i färger | – |
| 2 | Copy med presentation_profile | – |
| 3 | Inställningar – redigera profil & tema | – |
| 4 | Program/tips per profil | Content DB + admin (valfritt) |
| 5 | Övningsvideo per profil | Content DB schema |
| 6 | Dashboard/insikter profilmedveten | Steg 2 (copy) |
| 7 | Onboarding-känsla | Steg 1 (tema) |

**Rekommenderad ordning:** 1 → 2 → 3 → 6 → 7 (snabb visuell och copy-effekt), sedan 4 och 5 när Content DB/admin är redo.
