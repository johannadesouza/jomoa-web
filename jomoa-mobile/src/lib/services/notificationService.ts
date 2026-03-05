/**
 * Notification Service
 *
 * Hanterar lokala pushnotiser för daglig check-in-påminnelse.
 * Använder expo-notifications för schemalagda lokala notiser — ingen
 * backend eller push-token behövs för v1.
 *
 * Flöde:
 *   1. requestPermissions()       — begär tillstånd (iOS kräver explicit)
 *   2. scheduleDailyCheckin()     — schemalägger 07:30 varje dag (ersätter
 *                                   eventuell befintlig notis av samma typ)
 *   3. cancelDailyCheckin()       — avbokar (t.ex. om användaren stänger av)
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const CHECKIN_IDENTIFIER = "jomoa-daily-checkin";

// Konfigurera hur notiser visas när appen är i förgrunden
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Notis-innehåll per situation ─────────────────────────────────────────────

const CHECKIN_MESSAGES = [
  { title: "God morgon 🌿", body: "Hur mår du idag? Logga in och starta passet." },
  { title: "Ditt pass väntar 💪", body: "Ta en minut för check-in – kroppen förtjänar det." },
  { title: "Ny dag, ny energi", body: "Logga sömn och energi för anpassad träning idag." },
  { title: "Kroppen pratar 🔋", body: "Hur känns det idag? Öppna appen och kolla ditt pass." },
  { title: "Morgonrutin ☀️", body: "Snabb check-in + ditt pass – allt på ett ställe." },
];

function pickMessage(hour: number) {
  // Deterministisk baserat på dag i veckan — varierar utan att vara slumpmässig
  const dayIndex = new Date().getDay();
  return CHECKIN_MESSAGES[dayIndex % CHECKIN_MESSAGES.length];
}

// ─── Tillståndshantering ──────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  // Simulator och emulatorer stöder inte push — returnera true ändå för dev
  if (!Device.isDevice) {
    return true;
  }

  // Android 13+ kräver explicit tillstånd
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-checkin", {
      name: "Daglig påminnelse",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#D96D46",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Schemaläggning ───────────────────────────────────────────────────────────

/**
 * Schemalägger en daglig lokal notis kl. 07:30.
 * Avbokar alltid en eventuell befintlig notis av samma typ först
 * för att undvika duplicering vid omstart/ominstallation.
 */
export async function scheduleDailyCheckin(hour = 7, minute = 30): Promise<void> {
  // Avboka befintlig först
  await cancelDailyCheckin();

  const message = pickMessage(hour);

  await Notifications.scheduleNotificationAsync({
    identifier: CHECKIN_IDENTIFIER,
    content: {
      title: message.title,
      body: message.body,
      sound: false,
      data: { screen: "Home", openMorningRoutine: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyCheckin(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(CHECKIN_IDENTIFIER);
}

/**
 * Kontrollerar om en daglig check-in-notis redan är schemalagd.
 * Används för att undvika omschemaläggning vid varje app-start.
 */
export async function isDailyCheckinScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === CHECKIN_IDENTIFIER);
}
