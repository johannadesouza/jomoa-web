/**
 * UI text strings for Coach Dashboard
 */

import { ONBOARDING_TASK_KEYS } from "../domain/constants";

export const DASHBOARD_COPY = {
  header: {
    title: "Dashboard",
    subtitle: "Översikt över dina klienter och aktivitet",
  },
  onboarding: {
    title: "Kom igång",
    description: "Följ dessa steg för att komma igång med JOMOA:",
    actions: {
      goToClients: "Gå till Klienter →",
      goToPrograms: "Gå till Program →",
      openProgram: "Öppna program →",
      assignProgram: "Tilldela program →",
    },
  },
  attention: {
    title: "Behöver din attention",
    lowReadiness: (count: number) => `Låg readiness idag (${count})`,
    notTrainedRecently: (count: number) => `Inte tränat senaste 7 dagarna (${count})`,
    incompleteWorkouts: (count: number) => `Påbörjat pass ej avslutat (${count})`,
    lowReadinessReason: "Låg readiness",
    notTrainedReason: "Inte tränat senaste 7 dagarna",
    incompleteWorkoutReason: "Påbörjat pass ej avslutat",
    notTrainedDetails: "Har aktivt program men inga passloggar",
  },
  notifications: {
    title: "Notiscenter",
    unread: (count: number) => `${count} olästa`,
    viewAll: "Visa alla →",
    viewAllCount: (count: number) => `Visa alla ${count} notiser →`,
  },
  stats: {
    totalClients: "Antal klienter",
    trainedLast7Days: "Tränat senaste 7 dagarna",
    withoutReadiness: "Utan readiness idag",
    ofClients: (total: number) => `av ${total} klienter`,
  },
  recentWorkouts: {
    title: "Senaste genomförda pass",
    noWorkouts: "Inga genomförda pass ännu",
    completed: "Genomfört",
  },
  errors: {
    cannotLoad: "Kunde inte ladda dashboard",
  },
} as const;

