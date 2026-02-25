-- ============================================================================
-- Seed: Cykelinformation och välmående-content
-- Kör i Content DB (fohthpiyrxeyezjjvcva) efter 004_ och 005_-migrations
-- ============================================================================

-- ============================================================
-- 1. Cykelns faser
-- ============================================================
INSERT INTO public.cycle_phases (id, name, order_index, typical_days, color_hex, description, hormone_profile, energy_level)
VALUES
  (
    'menstruation',
    'Menstruation',
    1,
    'Dag 1–5',
    '#E57373',
    'Kroppen fäller livmoderslemhinnan. Östrogen och progesteron är låga, vilket kan ge trötthet och ömhet. Lyssna på kroppen och prioritera återhämtning.',
    'Östrogen och progesteron är som lägst. FSH börjar sakta stiga mot slutet av fasen.',
    'low'
  ),
  (
    'follikular',
    'Follikulär fas',
    2,
    'Dag 6–13',
    '#81C784',
    'Östrogen stiger successivt när folliklarna mognar. Energin ökar, humöret lyfter och kroppen är redo för mer utmaning. En av cykelns bästa träningsfaser.',
    'FSH stimulerar äggmogning och östrogen stiger stadigt. Testosteron börjar också öka mot slutet.',
    'high'
  ),
  (
    'ovulation',
    'Ägglossning',
    3,
    'Dag 14–16',
    '#FFD54F',
    'LH-toppen utlöser ägglossning. Energi och styrka är som högst – ett perfekt tillfälle för intensiv träning. Många upplever ökat självförtroende och social energi.',
    'LH-topp utlöser ägglossning. Östrogen når sin högsta punkt, testosteron ökar kortvarigt.',
    'high'
  ),
  (
    'luteal',
    'Lutealfas',
    4,
    'Dag 17–28',
    '#9575CD',
    'Progesteron dominerar och kroppen förbereder sig antingen för implantation eller menstruation. Energin varierar och PMS-symtom kan uppstå i slutet av fasen.',
    'Progesteron är högt, östrogen sjunker gradvis. Mot slutet faller båda hormoner vilket kan ge PMS.',
    'variable'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index,
  typical_days = EXCLUDED.typical_days,
  color_hex = EXCLUDED.color_hex,
  description = EXCLUDED.description,
  hormone_profile = EXCLUDED.hormone_profile,
  energy_level = EXCLUDED.energy_level;

-- ============================================================
-- 2. Träningsrekommendationer per fas
-- ============================================================

-- Menstruation
INSERT INTO public.phase_training_tips (phase_id, title, body, intensity, tip_type, order_index) VALUES
  ('menstruation', 'Lyssna på kroppen', 'Det är helt okej att ta det lugnt eller hoppa över träningen. Rörelse ska kännas bra – inte som ett tvång under mensen.', 'light', 'recommendation', 1),
  ('menstruation', 'Yoga och stretching', 'Lätt yoga, stretching och promenader kan lindra kramper och trötthet utan att belasta kroppen extra.', 'light', 'recommendation', 2),
  ('menstruation', 'Undvik extremt hård träning', 'Intensiva pass kan förvärra trötthet och smärta. Spara de tunga passen till follikulärfasen.', 'light', 'warning', 3),
  ('menstruation', 'Värme hjälper', 'Värme mot magen innan träning kan lindra kramper och göra rörelse mer bekvämt.', 'light', 'recommendation', 4);

-- Follikulär fas
INSERT INTO public.phase_training_tips (phase_id, title, body, intensity, tip_type, order_index) VALUES
  ('follikular', 'Din starkaste träningsfas', 'Stigande östrogen ökar muskelfunktion, återhämtning och motivation. Passa på att träna hårt!', 'high', 'motivation', 1),
  ('follikular', 'Perfekt för nya utmaningar', 'Testa nya övningar, öka vikterna eller börja ett nytt program. Kroppen är redo att anpassa sig.', 'high', 'recommendation', 2),
  ('follikular', 'Styrketräning ger extra resultat', 'Forskning visar att muskeltillväxt är extra effektiv under follikulärfasen tack vare höga östrogennivåer.', 'high', 'recommendation', 3),
  ('follikular', 'HIIT och intervaller', 'Kroppen återhämtar sig snabbare nu – ett utmärkt tillfälle för intensiva intervallpass.', 'high', 'recommendation', 4);

-- Ägglossning
INSERT INTO public.phase_training_tips (phase_id, title, body, intensity, tip_type, order_index) VALUES
  ('ovulation', 'Maximal kapacitet', 'Du är troligtvis som starkast och snabbast nu. Testa personliga rekord eller kör ditt mest utmanande pass.', 'high', 'motivation', 1),
  ('ovulation', 'Tänk på ledstabilitet', 'Högt östrogen kan göra leder något mer instabila. Fokusera på teknik och undvik explosiva riktningsbyten utan uppvärmning.', 'high', 'warning', 2),
  ('ovulation', 'Gruppass och lagträning', 'Det sociala energipåslaget under ägglossning gör gruppass och lagsport extra motiverande.', 'high', 'recommendation', 3);

-- Lutealfas
INSERT INTO public.phase_training_tips (phase_id, title, body, intensity, tip_type, order_index) VALUES
  ('luteal', 'Anpassa intensiteten', 'Energin kan variera dag till dag. Ha som plan att träna måttligt och lyssna på vad kroppen säger.', 'moderate', 'recommendation', 1),
  ('luteal', 'Styrka och stabilitet', 'Funktionell styrketräning och pilates fungerar bra – fokus på teknik snarare än maxvikt.', 'moderate', 'recommendation', 2),
  ('luteal', 'Återhämtningspass i slutet', 'Under de sista dagarna av lutealfasen kan ett lugnare pass kännas bättre än ett tungt. Lita på känslan.', 'light', 'recommendation', 3),
  ('luteal', 'Komplex kolhydrater före träning', 'Kroppen behöver mer glykogen nu. En måltid med havregryn, bönor eller sötpotatis 1–2 timmar före träning ger stabil energi.', 'moderate', 'recommendation', 4);

-- ============================================================
-- 3. Välmående och symtomlindring per fas
-- ============================================================

-- Menstruation
INSERT INTO public.phase_wellness_tips (phase_id, title, body, category, order_index) VALUES
  ('menstruation', 'Järnrik kost', 'Menstruationsblödning minskar järnlagren. Ät spenat, linser, pumpafrön och rött kött för att hålla energin uppe.', 'nutrition', 1),
  ('menstruation', 'Magnesium mot kramper', 'Magnesium kan hjälpa att slappna av livmodermuskulaturen och minska mensvärk. Mörkgröna grönsaker, nötter och choklad är bra källor.', 'nutrition', 2),
  ('menstruation', 'Värme och vila', 'Värmekudde mot magen, varma bad och tidiga kvällar kan lindra obehag och ge kroppen tid att återhämta sig.', 'symptoms', 3),
  ('menstruation', 'Minska inflammationsdrivande mat', 'Socker, alkohol och processad mat kan förvärra kramper och inflammation. Satsa på antiinflammatorisk kost som lax, gurkmeja och bär.', 'nutrition', 4),
  ('menstruation', 'Lugn andning och mindfulness', 'Diafragmaandning och kroppsscanningar kan aktivera det parasympatiska nervsystemet och minska smärtkänslighet.', 'mindfulness', 5);

-- Follikulär fas
INSERT INTO public.phase_wellness_tips (phase_id, title, body, category, order_index) VALUES
  ('follikular', 'Lätt och proteinrik kost', 'Metabolismen är lägre nu och tarmen fungerar ofta bättre. Fokusera på färska råvaror, grönsaker och magert protein.', 'nutrition', 1),
  ('follikular', 'Socialt och mentalt kapital', 'Det är en bra fas för att planera, lära sig nytt och ta tag i saker du skjutit upp. Hjärnan är skarp och motivationen hög.', 'stress', 2),
  ('follikular', 'Sömnkvalitet', 'Östrogen stödjer djupsömn. Håll regelbundna rutiner och undvik skärmar sent på kvällen för att maximera återhämtningen.', 'sleep', 3),
  ('follikular', 'Fermenterad mat', 'Kimchi, kefir, yoghurt och kombucha stödjer tarmfloran som i sin tur påverkar hormonbalansen positivt.', 'nutrition', 4);

-- Ägglossning
INSERT INTO public.phase_wellness_tips (phase_id, title, body, category, order_index) VALUES
  ('ovulation', 'Zink och antioxidanter', 'Zink (pumpakärnor, ostron) och antioxidanter (bär, färgglada grönsaker) stödjer äggkvalitet och hormonbalans.', 'nutrition', 1),
  ('ovulation', 'Var uppmärksam på stress', 'Hög stress kan störa ägglossningen. Prioritera återhämtning trots hög energi.', 'stress', 2),
  ('ovulation', 'Naturlig social energi', 'Känn in den sociala energin och utnyttja den – träffa vänner, ha svåra samtal eller presentera på jobbet.', 'mindfulness', 3);

-- Lutealfas
INSERT INTO public.phase_wellness_tips (phase_id, title, body, category, order_index) VALUES
  ('luteal', 'Magnesium och B6 mot PMS', 'Magnesium (400 mg/dag) och vitamin B6 kan signifikant minska PMS-symtom som humörsvängningar, uppsvälldhet och trötthet.', 'nutrition', 1),
  ('luteal', 'Minska salt och socker', 'Salt bidrar till vattenretention och uppsvälldhet. Socker skapar blodsockersvängningar som förvärrar humörsvängningar.', 'nutrition', 2),
  ('luteal', 'Prioritera sömn', 'Progesteron kan göra det svårare att sova mot slutet av fasen. Kyl ned sovrummet, undvik koffein efter lunch och lägg dig i tid.', 'sleep', 3),
  ('luteal', 'Lugn och meditation', 'Kortare meditationer (5–10 min) eller journaling kan hjälpa mot ångest och oro som är vanligare under lutealfasens sista dagar.', 'mindfulness', 4),
  ('luteal', 'Omega-3 mot inflammation', 'Omega-3-rika livsmedel (lax, makrill, chiafrön, valnötter) minskar prostaglandinnivåer och kan lindra krampkänslighet.', 'nutrition', 5),
  ('luteal', 'Rörelse mot PMS', 'Även lätt rörelse som promenader och stretching frigör endorfiner som motverkar PMS-relaterade humörsvängningar.', 'symptoms', 6);

-- ============================================================
-- 4. Readiness-insikter
-- ============================================================
INSERT INTO public.readiness_insights (readiness_min, readiness_max, title, body, suggestion) VALUES
  (0, 30,
   'Din kropp behöver vila',
   'Ditt readiness-värde är lågt. Kroppen signalerar att återhämtning prioriteras framför prestation idag.',
   'Välj ett lättare pass eller ta en aktiv vilodag med promenad och stretching.'),

  (31, 50,
   'Måttlig kapacitet idag',
   'Du är i form för rörelse men kroppen är inte helt återhämtad. Håll intensiteten under kontroll.',
   'Genomför ditt planerade pass men sänk vikterna eller tempon med 10–20%.'),

  (51, 70,
   'Bra form – kör på!',
   'Kroppen är återhämtad och redo för ett ordinärt träningspass. Följ din planerade träning.',
   'Genomför passet som planerat. Lyssna på signaler under träningen.'),

  (71, 85,
   'Hög kapacitet – utnyttja det',
   'Du är i toppform idag. Det är ett bra tillfälle att utmana dig lite extra.',
   'Lägg till ett extra set, öka vikten något eller testa ett personligt rekord.'),

  (86, 100,
   'Optimal dag för maxprestation',
   'Sällan är kroppen så redo som nu. Allt pekar på en riktigt bra träningsdag.',
   'Kör ditt mest krävande pass, testa nya rekord eller prova något du länge velat göra.');
