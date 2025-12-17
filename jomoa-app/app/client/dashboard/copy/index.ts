/**
 * UI text strings for Client Dashboard
 */

import { ONBOARDING_TASK_KEYS } from "../domain/constants";

export const DASHBOARD_COPY = {
  greeting: {
    title: (name: string | null) => `Hej ${name || "där"}! 👋`,
    subtitle: "Här är din dag i JOMOA",
  },
  hero: {
    title: "Dagens fokus",
    sessionPrompt: (sessionName: string) => `Dagens pass: ${sessionName}`,
    readinessPrompt: "Logga din readiness för att hjälpa din coach förstå din dagsform.",
    completed: (sessionName: string) => `Bra jobbat! Du har genomfört ${sessionName} idag.`,
    allDone: "Allt är klart för idag. Bra jobbat!",
  },
  statusCards: {
    nextWorkout: {
      label: "Nästa pass",
      noWorkout: "Inget pass planerat",
      completed: "Genomfört",
      started: "Påbörjad",
      viewProgram: "Visa program",
    },
    readiness: {
      label: "Readiness",
      notFilled: "Inte ifyllt idag",
      energy: "Energi",
      sleep: "Sömn",
      update: "Uppdatera",
    },
    cycle: {
      label: "Cykel",
      noData: "Ingen cykeldata",
      adjust: "Justera",
      log: "Logga",
      lastPeriodStart: (date: string) => `Senaste mensstart: ${date}`,
    },
    activeProgram: {
      label: "Aktivt program",
      startDate: (date: string) => `Start: ${date}`,
      viewProgram: "Visa program",
    },
  },
  tips: {
    title: "Dagens tips",
    viewAll: "Visa alla tips →",
    categories: {
      training: "Träning",
      nutrition: "Kost",
      cycle: "Cykel",
      mindset: "Mindset",
    },
    phases: {
      menstruation: "Mens",
      follicular: "Follikulär",
      ovulation: "Ägglossning",
      luteal: "Luteal",
    },
  },
  onboarding: {
    title: "Kom igång",
    description: "Följ dessa steg för att komma igång med JOMOA:",
    actions: {
      logReadiness: "Logga readiness →",
      logPeriodStart: "Logga mensstart →",
      startWorkout: "Starta pass →",
    },
  },
  actions: {
    startWorkout: "Starta pass",
    logReadiness: "Logga hur du mår",
    processing: "Bearbetar...",
  },
  errors: {
    noClientId: "Klient-ID saknas.",
    cannotStartSession: "Kunde inte starta pass. Försök igen senare.",
    cannotFetchClient: "Kunde inte hämta klientinformation. Försök igen senare.",
    cannotVerifyRole: "Kunde inte verifiera användarroll. Försök igen senare.",
    noPermission: "Du har inte rätt behörighet. Kontakta support.",
    clientNotActive: "Din klientprofil är inte aktiv. Kontakta din coach.",
    cannotFetchProgram: "Kunde inte hämta program. Försök igen senare.",
    cannotFetchSessions: "Kunde inte hämta pass. Försök igen senare.",
    rlsError: "Åtkomst nekad. Kontrollera att RLS policies är korrekt konfigurerade.",
  },
  loading: "Laddar...",
  success: {
    readinessSaved: "Readiness sparad!",
  },
} as const;

