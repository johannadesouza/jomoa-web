-- ============================================================================
-- Content DB: Cykelinformation och välmående-content
-- Kör i Content DB (fohthpiyrxeyezjjvcva)
-- ============================================================================

-- Allmän information om menscykelns faser
CREATE TABLE IF NOT EXISTS public.cycle_phases (
  id              TEXT PRIMARY KEY,           -- 'menstruation' | 'follikular' | 'ovulation' | 'luteal'
  name            TEXT NOT NULL,              -- Visningsnamn, t.ex. "Follikulär fas"
  order_index     INT NOT NULL,               -- Visningsordning (1-4)
  typical_days    TEXT NOT NULL,              -- t.ex. "Dag 1–5"
  color_hex       TEXT NOT NULL,              -- Färgkod för UI
  description     TEXT NOT NULL,             -- Kort beskrivning
  hormone_profile TEXT,                       -- Hormonbeskrivning
  energy_level    TEXT,                       -- 'low' | 'medium' | 'high' | 'variable'
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Träningsrekommendationer per fas
CREATE TABLE IF NOT EXISTS public.phase_training_tips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id     TEXT NOT NULL REFERENCES public.cycle_phases(id),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  intensity    TEXT,   -- 'light' | 'moderate' | 'high'
  tip_type     TEXT,   -- 'recommendation' | 'warning' | 'motivation'
  order_index  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Välmående- och symtomlindring per fas
CREATE TABLE IF NOT EXISTS public.phase_wellness_tips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id     TEXT NOT NULL REFERENCES public.cycle_phases(id),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  category     TEXT,   -- 'nutrition' | 'sleep' | 'stress' | 'symptoms' | 'mindfulness'
  order_index  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Readiness-insikter (kopplade till poängnivå)
CREATE TABLE IF NOT EXISTS public.readiness_insights (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_min  INT NOT NULL,   -- t.ex. 0
  readiness_max  INT NOT NULL,   -- t.ex. 40
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  suggestion     TEXT,           -- Konkret åtgärd
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_phase_training_tips_phase ON public.phase_training_tips(phase_id);
CREATE INDEX IF NOT EXISTS idx_phase_wellness_tips_phase ON public.phase_wellness_tips(phase_id);
CREATE INDEX IF NOT EXISTS idx_readiness_insights_range ON public.readiness_insights(readiness_min, readiness_max);
