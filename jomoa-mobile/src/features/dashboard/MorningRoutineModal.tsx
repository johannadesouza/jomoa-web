/**
 * MorningRoutineModal – friktionsfritt morgonflöde.
 *
 * Ersätter Dashboard → ReadinessScreen → tillbaka → Preview → Session
 * med ett enda modal-steg:
 *
 *   Steg 1 "checkin"   – 4 emoji-skalor (ingen tangentbord)
 *   Steg 2 "adapt"     – visar live adaptation-output baserat på inmatning
 *   → Spara readiness + strategi-beslut → navigera direkt till WorkoutSession
 *
 * Använder befintlig arkitektur rakt av:
 *   - computeAdaptation()         (ren funktion, ingen hook)
 *   - saveReadiness()             (readinessService)
 *   - saveStrategyDecision()      (strategyDecisionService)
 *   - useRecentLoad / useWeeklyProgression / useStrategyAcceptanceRate
 *   - useCycleContext / useTodayPerimenopauseSymptoms
 */

import React, { useState, useMemo, useEffect } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { YStack, XStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Card, AppText, AppButton, AppIcon } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useRecentLoad } from "../../lib/hooks/useRecentLoad";
import { useWeeklyProgression } from "../../lib/hooks/useWeeklyProgression";
import { useStrategyAcceptanceRate } from "../../lib/hooks/useStrategyAcceptanceRate";
import { useTodayPerimenopauseSymptoms } from "../../lib/hooks/useTodayPerimenopauseSymptoms";
import { computeAdaptation } from "../../lib/adaptation/engine";
import { saveReadiness } from "../../lib/services/readinessService";
import { saveStrategyDecision } from "../../lib/services/strategyDecisionService";
import { getLocalDateString } from "../../lib/utils/date";
import { getItem, setItem, storageKeys } from "../../lib/store/storage";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import {
  RULE_LABELS,
  getAdaptHeadlineFromParts,
  getVolumeLabel,
} from "../../lib/adaptation/adaptationLabels";
import { RootStackParamList } from "../../navigation/RootNavigator";
import type { ProgramSessionData } from "../../lib/services/workoutService";

// ─── Typer ────────────────────────────────────────────────────────────────────

type Step = "checkin" | "adapt";

/** 3-gradig skala: värden som matchar engine-trösklarna (≤3, 5, ≥7) */
type Level = 2 | 5 | 8;

interface CheckinState {
  sleepQuality: Level;
  energyLevel: Level;
  stressLevel: Level;
  soreness: Level;
}

const DEFAULT_CHECKIN: CheckinState = {
  sleepQuality: 5,
  energyLevel: 5,
  stressLevel: 5,
  soreness: 5,
};

// ─── Emoji-skalor ─────────────────────────────────────────────────────────────

interface ScaleOption {
  value: Level;
  emoji: string;
  label: string;
}

const SLEEP_OPTIONS: ScaleOption[] = [
  { value: 2, emoji: "😴", label: "Dålig" },
  { value: 5, emoji: "😐", label: "Okej" },
  { value: 8, emoji: "😊", label: "Bra" },
];
const ENERGY_OPTIONS: ScaleOption[] = [
  { value: 2, emoji: "🪫", label: "Låg" },
  { value: 5, emoji: "⚡", label: "Medel" },
  { value: 8, emoji: "🔋", label: "Hög" },
];
const STRESS_OPTIONS: ScaleOption[] = [
  // Stress är inverterat: hög stress = dåligt → value 8 = hög stress
  { value: 8, emoji: "😤", label: "Hög" },
  { value: 5, emoji: "😐", label: "Medel" },
  { value: 2, emoji: "😌", label: "Låg" },
];
const SORENESS_OPTIONS: ScaleOption[] = [
  { value: 8, emoji: "😣", label: "Ömmar" },
  { value: 5, emoji: "😐", label: "Lite" },
  { value: 2, emoji: "✅", label: "Fin" },
];

// ─── Sub-komponent: EmojisSkala ───────────────────────────────────────────────

interface EmojiScaleProps {
  label: string;
  options: ScaleOption[];
  value: Level;
  onChange: (v: Level) => void;
  colors: ReturnType<typeof getThemeColors>;
}

function EmojiScale({ label, options, value, onChange, colors }: EmojiScaleProps) {
  return (
    <YStack gap="$2">
      <AppText variant="caption" muted>{label}</AppText>
      <XStack gap="$2" justifyContent="space-between">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={{ flex: 1 }}
            >
              <YStack
                alignItems="center"
                paddingVertical="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor={active ? colors.accent : colors.borderSoft}
                backgroundColor={active ? colors.accent + "22" : "transparent"}
                gap="$1"
              >
                <AppText variant="h2">{opt.emoji}</AppText>
                <AppText
                  variant="caption"
                  color={active ? "$accent" : "$textSecondary"}
                  fontWeight={active ? "700" : "400"}
                >
                  {opt.label}
                </AppText>
              </YStack>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}

// ─── Huvudkomponent ───────────────────────────────────────────────────────────

export interface MorningRoutineModalProps {
  visible: boolean;
  todaySession: ProgramSessionData | null;
  onClose: () => void;
  onReadinessSaved: () => void;
}

export function MorningRoutineModal({
  visible,
  todaySession,
  onClose,
  onReadinessSaved,
}: MorningRoutineModalProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { client } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const copy = useAppCopy("sv");

  const { phase, mode } = useCycleContext();
  const recentLoad = useRecentLoad(client?.id);
  const weeklyProgression = useWeeklyProgression(client?.id);
  const strategyStats = useStrategyAcceptanceRate(client?.id);
  const periSymptoms = useTodayPerimenopauseSymptoms(
    mode === "perimenopause" ? client?.id : undefined
  );

  const [step, setStep] = useState<Step>("checkin");
  const [checkin, setCheckin] = useState<CheckinState>(DEFAULT_CHECKIN);
  const [applyAdaptation, setApplyAdaptation] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanationSeen, setExplanationSeen] = useState(true);

  useEffect(() => {
    if (!visible) return;
    getItem<boolean>(storageKeys.READINESS_EXPLANATION_SEEN).then((seen) =>
      setExplanationSeen(seen === true)
    );
  }, [visible]);

  // Beräkna adaptation live baserat på lokal checkin-state
  // computeAdaptation är en ren funktion — inga side effects
  const liveAdaptation = useMemo(() => {
    return computeAdaptation({
      mode: mode ?? "regular",
      cyclePhase: mode === "regular" ? (phase ?? null) : null,
      perimenopauseSymptoms: mode === "perimenopause" ? (periSymptoms ?? null) : null,
      readiness: {
        sleep_quality: checkin.sleepQuality,
        energy_level: checkin.energyLevel,
        stress_level: checkin.stressLevel,
        soreness: checkin.soreness,
      },
      trainingLoad: recentLoad
        ? { sessionsLast7Days: recentLoad.sessionsLast7Days, volumeLast7Days: recentLoad.volumeLast7Days }
        : null,
      weeklyProgression: weeklyProgression
        ? { lastWeekPlanned: weeklyProgression.lastWeekPlanned, lastWeekCompleted: weeklyProgression.lastWeekCompleted, completionRate: weeklyProgression.completionRate }
        : null,
      strategyPreference: strategyStats
        ? { acceptanceRate: strategyStats.acceptanceRate, decisionCount: strategyStats.decisionCount }
        : null,
    });
  }, [checkin, mode, phase, periSymptoms, recentLoad, weeklyProgression, strategyStats]);

  const hasSuggestion =
    liveAdaptation.volumeModifier !== 1.0 ||
    liveAdaptation.suggestDeload ||
    liveAdaptation.suggestRecovery;

  const handleClose = () => {
    if (step === "adapt") setItem(storageKeys.READINESS_EXPLANATION_SEEN, true).then(() => setExplanationSeen(true));
    setStep("checkin");
    setCheckin(DEFAULT_CHECKIN);
    setApplyAdaptation(null);
    setError(null);
    onClose();
  };

  const handleCheckinNext = () => {
    setItem(storageKeys.READINESS_EXPLANATION_SEEN, true).then(() => setExplanationSeen(true));
    setStep("adapt");
  };

  const handleStart = async () => {
    if (!client?.id || !todaySession) return;

    setSaving(true);
    setError(null);

    try {
      // Spara readiness och eventuellt strategi-beslut parallellt
      const ops: Promise<unknown>[] = [
        saveReadiness({
          client_id: client.id,
          date: getLocalDateString(),
          sleep_quality: checkin.sleepQuality,
          energy_level: checkin.energyLevel,
          stress_level: checkin.stressLevel,
          soreness: checkin.soreness,
        }),
      ];

      if (hasSuggestion) {
        ops.push(
          saveStrategyDecision({
            clientId: client.id,
            sessionId: todaySession.id,
            isStandalone: false,
            suggestedVolumeModifier: liveAdaptation.volumeModifier,
            accepted: applyAdaptation ?? false,
          })
        );
      }

      await Promise.all(ops);

      onReadinessSaved();
      handleClose();

      navigation.navigate("WorkoutSession", {
        sessionId: todaySession.id,
        isStandalone: false,
        applyAdjustment: hasSuggestion ? (applyAdaptation ?? false) : undefined,
      });
    } catch (e) {
      setError("Kunde inte spara – försök igen");
    } finally {
      setSaving(false);
    }
  };

  const { text: volumeLabel, isPositive } = getVolumeLabel(liveAdaptation.volumeModifier);
  const adaptHeadline = getAdaptHeadlineFromParts(
    liveAdaptation.volumeModifier,
    liveAdaptation.appliedRules,
    liveAdaptation.suggestRecovery
  );
  const driverLabels = liveAdaptation.appliedRules
    .slice(0, 2)
    .map((id) => RULE_LABELS[id])
    .filter(Boolean);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop="$4"
      >
        {/* Header */}
        <XStack
          paddingHorizontal="$5"
          paddingBottom="$4"
          alignItems="center"
          justifyContent="space-between"
        >
          <YStack gap="$0.5">
            <AppText variant="h2">
              {step === "checkin"
                ? getAppCopy(copy, "morning_routine_step_checkin", "Hur mår du idag?")
                : getAppCopy(copy, "morning_routine_step_workout", "Ditt pass idag")}
            </AppText>
            {todaySession && (
              <AppText variant="caption" muted>
                {todaySession.name}
              </AppText>
            )}
          </YStack>
          <Pressable onPress={handleClose} hitSlop={12}>
            <AppIcon name="close-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </XStack>

        {/* Steg-indikator */}
        <XStack paddingHorizontal="$5" gap="$2" marginBottom="$5">
          {(["checkin", "adapt"] as Step[]).map((s, i) => (
            <YStack
              key={s}
              flex={1}
              height={3}
              borderRadius="$full"
              backgroundColor={
                step === s
                  ? "$accent"
                  : i < (step === "adapt" ? 1 : 0)
                  ? "$accent"
                  : "$surface3"
              }
            />
          ))}
        </XStack>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Steg 1: Check-in ────────────────────────────────── */}
          {step === "checkin" && (
            <YStack gap="$5">
              {!explanationSeen && (
                <AppText variant="small" muted>
                  {getAppCopy(copy, "readiness_first_time_explanation", "När du loggar sömn och energi får du bättre rekommendationer – Öka, Behåll eller Justera.")}
                </AppText>
              )}
              <AppText variant="small" muted>
                Fyra snabba val – ingen tangentbord behövs.
              </AppText>

              <EmojiScale
                label="Sömn"
                options={SLEEP_OPTIONS}
                value={checkin.sleepQuality}
                onChange={(v) => setCheckin((p) => ({ ...p, sleepQuality: v }))}
                colors={colors}
              />
              <EmojiScale
                label="Energi"
                options={ENERGY_OPTIONS}
                value={checkin.energyLevel}
                onChange={(v) => setCheckin((p) => ({ ...p, energyLevel: v }))}
                colors={colors}
              />
              <EmojiScale
                label="Stress"
                options={STRESS_OPTIONS}
                value={checkin.stressLevel}
                onChange={(v) => setCheckin((p) => ({ ...p, stressLevel: v }))}
                colors={colors}
              />
              <EmojiScale
                label="Muskelömhet"
                options={SORENESS_OPTIONS}
                value={checkin.soreness}
                onChange={(v) => setCheckin((p) => ({ ...p, soreness: v }))}
                colors={colors}
              />

              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleCheckinNext}
                marginTop="$2"
              >
                Fortsätt →
              </AppButton>
            </YStack>
          )}

          {/* ── Steg 2: Adaptation + starta ─────────────────────── */}
          {step === "adapt" && (
            <YStack gap="$4">
              <AppText variant="small" muted>
                {getAppCopy(copy, "morning_routine_adapt_explanation", "Utifrån din check-in föreslår appen: Öka belastning, Behåll planen eller Justera (lättare pass idag). Standard är att behålla.")}
              </AppText>
              {/* Adaptation-kort */}
              <Card backgroundColor="$surface3" borderColor="$borderSoft">
                <Card.Content>
                  <YStack gap="$3">
                    <XStack alignItems="flex-start" gap="$3">
                      <YStack
                        width={44}
                        height={44}
                        borderRadius="$full"
                        backgroundColor={isPositive ? "$accent" : "$surface2"}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <AppIcon
                          name={
                            liveAdaptation.suggestRecovery
                              ? "leaf-outline"
                              : liveAdaptation.volumeModifier >= 1.05
                              ? "flash-outline"
                              : "body-outline"
                          }
                          size={20}
                          color={isPositive ? colors.background : colors.textSecondary}
                        />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <AppText variant="h3">{adaptHeadline}</AppText>
                        <AppText
                          variant="caption"
                          color={isPositive ? "$accent" : "$textSecondary"}
                          fontWeight="600"
                        >
                          {volumeLabel}
                        </AppText>
                      </YStack>
                    </XStack>

                    {driverLabels.length > 0 && (
                      <YStack
                        gap="$1.5"
                        paddingVertical="$2"
                        paddingHorizontal="$3"
                        backgroundColor="$surface2"
                        borderRadius="$2"
                      >
                        {driverLabels.map((label, i) => (
                          <XStack key={i} alignItems="center" gap="$2">
                            <YStack
                              width={5}
                              height={5}
                              borderRadius="$full"
                              backgroundColor="$accent"
                              flexShrink={0}
                            />
                            <AppText variant="caption" muted>{label}</AppText>
                          </XStack>
                        ))}
                      </YStack>
                    )}

                    {/* Accept / Behåll — visas bara om det finns en justering */}
                    {hasSuggestion && (
                      <XStack gap="$3">
                        <Pressable onPress={() => setApplyAdaptation(true)} style={{ flex: 1 }}>
                          <YStack
                            padding="$3"
                            borderRadius="$2"
                            backgroundColor={applyAdaptation === true ? "$accent" : "$card"}
                            borderWidth={1}
                            borderColor={applyAdaptation === true ? "$accent" : "$borderSoft"}
                            alignItems="center"
                          >
                            <AppText
                              variant="small"
                              fontWeight="600"
                              color={applyAdaptation === true ? "$background" : "$color"}
                            >
                              Ja, anpassa
                            </AppText>
                          </YStack>
                        </Pressable>
                        <Pressable onPress={() => setApplyAdaptation(false)} style={{ flex: 1 }}>
                          <YStack
                            padding="$3"
                            borderRadius="$2"
                            backgroundColor={applyAdaptation === false ? "$surface3" : "$card"}
                            borderWidth={1}
                            borderColor="$borderSoft"
                            alignItems="center"
                          >
                            <AppText variant="small" fontWeight="600" color="$color">
                              Behåll plan
                            </AppText>
                          </YStack>
                        </Pressable>
                      </XStack>
                    )}
                  </YStack>
                </Card.Content>
              </Card>

              {/* Session-info */}
              {todaySession && (
                <Card>
                  <Card.Content>
                    <XStack alignItems="center" gap="$3">
                      <YStack
                        width={44}
                        height={44}
                        borderRadius="$full"
                        backgroundColor="$accent"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <AppIcon name="barbell-outline" size={20} color={colors.background} />
                      </YStack>
                      <YStack flex={1} gap="$0.5">
                        <AppText variant="h3">{todaySession.name}</AppText>
                        <AppText variant="caption" muted>
                          {todaySession.session_exercises?.length ?? 0} övningar
                          {todaySession.focus ? ` · ${todaySession.focus}` : ""}
                        </AppText>
                      </YStack>
                    </XStack>
                  </Card.Content>
                </Card>
              )}

              {error && (
                <AppText variant="caption" color="$error">{error}</AppText>
              )}

              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                loading={saving}
                disabled={saving || (hasSuggestion && applyAdaptation === null)}
                onPress={handleStart}
              >
                {saving ? "Sparar..." : "Starta passet"}
              </AppButton>

              {hasSuggestion && applyAdaptation === null && (
                <AppText variant="caption" muted center>
                  Välj anpassning ovan för att fortsätta
                </AppText>
              )}

              <Pressable onPress={() => setStep("checkin")}>
                <AppText variant="caption" color="$accent" center>
                  ← Ändra check-in
                </AppText>
              </Pressable>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Modal>
  );
}
