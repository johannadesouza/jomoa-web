# Beslut: adjustment_history vs strategy_decisions

## Bakgrund

- **strategy_decisions** – används av jomoa-mobile för att spara användarens val (accepted: ja/nej) kopplat till ett förslag (Öka/Behåll/Justera). T.ex. i `strategyDecisionService` och adaptation-flödet.
- **adjustment_history** – mer detaljerad historik per justering (adjustment_type, volume_reduction_percent, cycle_phase, readiness_energy, etc.). Finns i User-DB-schemat men används **inte** av mobilappen.

## Beslut

**Behåll strategy_decisions** som källa för användarens beslut i appen. **Deprecera eller ta inte i bruk adjustment_history** för mobilflödet så länge ni inte behöver full historik för analytics eller coach-vy.

Om ni senare vill ha en rikare historik kan ni antingen:
- Utöka strategy_decisions med fler kolumner (t.ex. volume_modifier, phase), eller
- Introducera en migrering från strategy_decisions till adjustment_history och byta appen till att skriva till adjustment_history.

Fram tills dess: undvik att skriva till adjustment_history från appen så att en enda källa (strategy_decisions) gäller.
