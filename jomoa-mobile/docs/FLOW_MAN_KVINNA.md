# Flöde man vs kvinna

Kort dokumentation av hur presentation (man/kvinna/annat) påverkar onboarding och huvudappen.

## Onboarding – samma steg för alla

Alla användare går genom samma sekvens. Kön (`presentation_profile`) styr **inte** vilka skärmar som visas under onboarding.

1. **Welcome** → **Gender** (Man / Kvinna / Annat) → **Theme** (bold / soft / neutral)
2. **CycleQuestion:** "Har du menscykel?" – **alla** ser den. Ja → PathChoice, Nej → Goals med `wantsCycleTracking: false`, `onboardingPath: "training_only"`.
3. **PathChoice** (om Ja): Cykel endast / Endast träning / Båda. "Endast cykel" → CycleSetup direkt; annars Goals → Frequency → TrainingDays → CycleSetup (om Båda) eller Complete.
4. **Goals** → **Frequency** → **TrainingDays**
5. **CycleSetup** (om användaren valt cykel): Senaste periodstart. Sedan **Complete**.

Alltså: även män ser "Har du menscykel?" och kan svara Nej (typiskt) eller Ja. Ingen grenning sker på `presentation_profile` under onboarding.

## Efter onboarding – vad som skiljer

`presentation_profile` används **bara** för att visa eller dölja **cykel-UI**:

| Var | Villkor | Effekt |
|-----|--------|--------|
| DashboardScreen | `showCycleInUI = client?.presentation_profile !== "male"` | Cykelkort/cykelinfo visas inte för "Man" |
| JourneyScreen | Samma | Cykelrelaterade insikter/segment döljs för "Man" |
| SettingsScreen | Samma | Menyposten "Menscykel" (navigering till Cycle) visas inte för "Man" |

- **Man:** Samma träning, check-in, readiness, Öka/Behåll/Justera – men ingen cykel-flik, inget cykelkort på hem, ingen cykel i inställningar. App copy hämtas för `male` från Content DB (`app_copy`).
- **Kvinna / Annat:** Om de valt cykel i onboarding ser de full cykel-UI (Cykel-skärm, fas, periodlogg, inställningar för cycle mode).

**OBS:** Om en man väljer "Ja" på CycleQuestion sparas `wantsCycleTracking: true` och han kan hamna i CycleSetup – men i huvudappen finns inga länkar till Cykel-skärmen. Data kan alltså finnas utan att han kan nå den. Se ev. anpassning i planen (t.ex. dölj CycleQuestion för man eller sätt alltid `wantsCycleTracking: false` för man).

## Tema

`presentation_theme` (bold / soft / neutral) är oberoende av kön och styr bara färg och stil via `useThemeColors` och `colors.ts`.

## Referenser

- Onboarding: `src/features/onboarding/` (GenderScreen, CycleQuestionScreen, PathChoiceScreen, …).
- Villkor: `showCycleInUI` i DashboardScreen, JourneyScreen, SettingsScreen.
- App copy: `src/lib/repos/contentRepo/appCopy.ts`, `useAppCopy`.
