import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { YStack, XStack } from "tamagui";
import { Pressable } from "react-native";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppInput,
  LoadingScreen,
  EmptyState,
  ErrorState,
} from "../../shared/ui";
import { getLocalDateString } from "../../lib/utils/date";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import { useCyclePhase } from "../../lib/hooks/useCyclePhase";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { OverdueBanner } from "./OverdueBanner";
import { CycleHeroCard } from "../insights/CycleHeroCard";
import { CycleCategoryStrip } from "../../components/cycle/CycleCategoryStrip";
import {
  fetchSymptomOptions,
  type SymptomOption,
} from "../../lib/repos/contentRepo";
import {
  MOOD_OPTIONS,
  CRAVINGS_OPTIONS,
  BLEEDING_OPTIONS,
} from "../../lib/data/symptomOptions";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CycleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { client } = useAuth();
  const {
    activeCycleStartDate: latestPeriodStart,
    phase,
    cycleDay,
    cycleLength,
    cycleLengthDisplay,
    rollingAvg,
    daysUntilNextPeriod,
    overdueState,
    mode: cycleMode,
    isLoading,
    error,
    refetch,
    logPeriodStart,
  } = useCycleContext();

  const { logSymptom } = useCyclePhase(client?.id);
  const [saving, setSaving] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [symptomCramps, setSymptomCramps] = useState("");
  const [symptomEnergy, setSymptomEnergy] = useState("");
  const [symptomMood, setSymptomMood] = useState<string | null>(null);
  const [symptomCravings, setSymptomCravings] = useState<string | null>(null);
  const [symptomBleeding, setSymptomBleeding] = useState<number | null>(null);
  const [savingSymptom, setSavingSymptom] = useState(false);
  const [symptomError, setSymptomError] = useState<string | null>(null);
  const [periodError, setPeriodError] = useState<string | null>(null);

  const copy = useAppCopy("sv");
  const cycleSectionTitle =
    cycleMode === "regular"
      ? getAppCopy(copy, "cycle_section_title_regular", "Din cykel")
      : cycleMode === "perimenopause"
        ? getAppCopy(copy, "cycle_section_title_perimenopause", "Peri-/menopaus")
        : getAppCopy(copy, "cycle_section_title_no_cycle", "Utebliven mens");

  const [moodOptions, setMoodOptions] = useState<SymptomOption[]>(MOOD_OPTIONS.map((o) => ({ option_id: o.id, label: o.label, value: null })));
  const [cravingsOptions, setCravingsOptions] = useState<SymptomOption[]>(CRAVINGS_OPTIONS.map((o) => ({ option_id: o.id, label: o.label, value: null })));
  const [bleedingOptions, setBleedingOptions] = useState<SymptomOption[]>(BLEEDING_OPTIONS.map((o) => ({ option_id: String(o.value), label: o.label, value: o.value })));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchSymptomOptions("mood"),
      fetchSymptomOptions("cravings"),
      fetchSymptomOptions("bleeding"),
    ])
      .then(([mood, cravings, bleeding]) => {
        if (!cancelled) {
          if (mood.length) setMoodOptions(mood);
          if (cravings.length) setCravingsOptions(cravings);
          if (bleeding.length) setBleedingOptions(bleeding);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleLogPeriod = async (dateStr: string) => {
    if (!dateStr) return;
    setSaving(true);
    setPeriodError(null);
    const { error: saveErr } = await logPeriodStart(dateStr);
    setSaving(false);
    if (!saveErr) {
      setCustomDate("");
      setShowCustom(false);
    } else {
      setPeriodError(saveErr);
    }
  };

  const handleLogPeriodToday = () => {
    handleLogPeriod(getLocalDateString());
  };

  const handleLogCustomDate = () => {
    const trimmed = customDate.trim();
    const match = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!match) {
      setPeriodError("Ange datum som ÅÅÅÅ-MM-DD, t.ex. 2025-02-15");
      return;
    }
    handleLogPeriod(trimmed);
  };

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <Screen padded>
        <ErrorState
          description={error}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  const handleLogPeriodYesterday = () => {
    handleLogPeriod(getYesterday());
  };

  const hasAnySymptom =
    symptomCramps.trim() !== "" ||
    symptomEnergy.trim() !== "" ||
    symptomMood != null ||
    symptomCravings != null ||
    symptomBleeding != null;

  const handleSaveSymptom = async () => {
    const cramps = parseInt(symptomCramps, 10);
    const energy = parseInt(symptomEnergy, 10);
    const hasCramps = !isNaN(cramps) && cramps >= 1 && cramps <= 5;
    const hasEnergy = !isNaN(energy) && energy >= 1 && energy <= 10;
    if (!hasCramps && !hasEnergy && !symptomMood && !symptomCravings && symptomBleeding == null) {
      setSymptomError("Fyll i minst ett fält");
      return;
    }
    setSavingSymptom(true);
    setSymptomError(null);
    const { error } = await logSymptom({
      date: getLocalDateString(),
      cramps_severity: hasCramps ? cramps : null,
      energy_level: hasEnergy ? energy : null,
      mood: symptomMood ?? null,
      cravings: symptomCravings ?? null,
      bleeding_level: symptomBleeding ?? null,
    });
    setSavingSymptom(false);
    if (error) {
      setSymptomError(error.message ?? "Kunde inte spara");
      return;
    }
    setSymptomCramps("");
    setSymptomEnergy("");
    setSymptomMood(null);
    setSymptomCravings(null);
    setSymptomBleeding(null);
  };

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title={cycleSectionTitle}>
          {latestPeriodStart ? (
            <>
              {overdueState !== "none" && (
                <OverdueBanner
                  overdueState={overdueState}
                  onLogPeriod={handleLogPeriodToday}
                />
              )}
              <CycleHeroCard
                phase={phase}
                cycleDay={cycleDay}
                cycleLength={cycleLengthDisplay}
                cycleLengthEstimated={rollingAvg != null}
                daysUntilNextPeriod={daysUntilNextPeriod}
                onPress={() => navigation.navigate("CycleInsights", {})}
                cycleMode={cycleMode}
                noPhaseMessage={getAppCopy(copy, "cycle_hero_no_phase", "Logga period för att se din cykel och hormonprofil")}
                noCycleModeMessage={getAppCopy(copy, "cycle_hero_no_cycle_mode", "Träning anpassas efter dagsform och symtom")}
                phaseLabelCaption={getAppCopy(copy, "cycle_phase_label_caption", "Din cykelfas")}
              />
              <Section title="Utforska" spacing="md">
                <CycleCategoryStrip
                  onCategoryPress={(id) =>
                    navigation.navigate("CycleInsights", { initialSegment: id })
                  }
                />
              </Section>
              <AppText variant="caption" muted>
                Senast loggad: {formatDate(latestPeriodStart)}
              </AppText>
            </>
          ) : (
            <Card>
              <Card.Content>
                <EmptyState
                  iconName="moon-outline"
                  title="Ingen cykeldata"
                  description="Logga när din senaste period började för att se din nuvarande fas och få träningsrekommendationer."
                  actionLabel="Logga period start idag"
                  onAction={handleLogPeriodToday}
                />
              </Card.Content>
            </Card>
          )}
        </Section>

        {latestPeriodStart && (
          <>
            <Section
              title="Logga period"
              subtitle="Början av din senaste mens"
              spacing="md"
            >
              <Card>
                <Card.Content>
                  <YStack gap="$3">
                    {periodError && (
                      <AppText variant="caption" color="$error">
                        {periodError}
                      </AppText>
                    )}
                    <XStack gap="$2">
                      <AppButton
                        variant="secondary"
                        flex={1}
                        size="sm"
                        onPress={handleLogPeriodToday}
                        loading={saving}
                      >
                        Idag
                      </AppButton>
                      <AppButton
                        variant="secondary"
                        flex={1}
                        size="sm"
                        onPress={handleLogPeriodYesterday}
                        loading={saving}
                      >
                        Igår
                      </AppButton>
                    </XStack>
                    {showCustom ? (
                      <YStack gap="$2">
                        <AppInput
                          placeholder="ÅÅÅÅ-MM-DD"
                          value={customDate}
                          onChangeText={setCustomDate}
                          keyboardType="numbers-and-punctuation"
                        />
                        <XStack gap="$2">
                          <AppButton
                            variant="secondary"
                            flex={1}
                            size="sm"
                            onPress={handleLogCustomDate}
                            loading={saving}
                          >
                            Spara
                          </AppButton>
                          <AppButton
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                              setShowCustom(false);
                              setCustomDate("");
                            }}
                          >
                            Avbryt
                          </AppButton>
                        </XStack>
                      </YStack>
                    ) : (
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowCustom(true)}
                      >
                        Annat datum
                      </AppButton>
                    )}
                  </YStack>
                </Card.Content>
              </Card>
            </Section>

            <Section
              title="Symtom idag"
              subtitle="Hjälper oss anpassa rekommendationer"
              spacing="md"
            >
              <Card>
                <Card.Content>
                  <YStack gap="$4">
                    <XStack gap="$3">
                      <YStack flex={1} gap="$1">
                        <AppText variant="caption" muted>
                          Kramper (1–5)
                        </AppText>
                        <AppInput
                          placeholder="1–5"
                          keyboardType="number-pad"
                          value={symptomCramps}
                          onChangeText={(v) => {
                            setSymptomCramps(v);
                            setSymptomError(null);
                          }}
                        />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <AppText variant="caption" muted>
                          Energi (1–10)
                        </AppText>
                        <AppInput
                          placeholder="1–10"
                          keyboardType="number-pad"
                          value={symptomEnergy}
                          onChangeText={(v) => {
                            setSymptomEnergy(v);
                            setSymptomError(null);
                          }}
                        />
                      </YStack>
                    </XStack>

                    <YStack gap="$2">
                      <AppText variant="caption" muted>
                        Blödning
                      </AppText>
                      <XStack gap="$2" flexWrap="wrap">
                        {bleedingOptions.map((opt) => {
                          const isSelected = symptomBleeding === (opt.value ?? null);
                          return (
                            <Pressable
                              key={opt.option_id}
                              onPress={() => {
                                setSymptomBleeding(isSelected ? null : (opt.value ?? null));
                                setSymptomError(null);
                              }}
                            >
                              <YStack
                                paddingVertical="$1"
                                paddingHorizontal="$3"
                                borderRadius="$2"
                                backgroundColor={isSelected ? "$accent" : "$surface3"}
                              >
                                <AppText
                                  variant="caption"
                                  fontWeight="500"
                                  color={isSelected ? "$background" : "$color"}
                                >
                                  {opt.label}
                                </AppText>
                              </YStack>
                            </Pressable>
                          );
                        })}
                      </XStack>
                    </YStack>

                    <YStack gap="$2">
                      <AppText variant="caption" muted>
                        Humör
                      </AppText>
                      <XStack gap="$2" flexWrap="wrap">
                        {moodOptions.map((opt) => {
                          const isSelected = symptomMood === opt.option_id;
                          return (
                            <Pressable
                              key={opt.option_id}
                              onPress={() => {
                                setSymptomMood(isSelected ? null : opt.option_id);
                                setSymptomError(null);
                              }}
                            >
                              <YStack
                                paddingVertical="$1"
                                paddingHorizontal="$3"
                                borderRadius="$2"
                                backgroundColor={isSelected ? "$accent" : "$surface3"}
                              >
                                <AppText
                                  variant="caption"
                                  fontWeight="500"
                                  color={isSelected ? "$background" : "$color"}
                                >
                                  {opt.label}
                                </AppText>
                              </YStack>
                            </Pressable>
                          );
                        })}
                      </XStack>
                    </YStack>

                    <YStack gap="$2">
                      <AppText variant="caption" muted>
                        Cravings
                      </AppText>
                      <XStack gap="$2" flexWrap="wrap">
                        {cravingsOptions.map((opt) => {
                          const isSelected = symptomCravings === opt.option_id;
                          return (
                            <Pressable
                              key={opt.option_id}
                              onPress={() => {
                                setSymptomCravings(isSelected ? null : opt.option_id);
                                setSymptomError(null);
                              }}
                            >
                              <YStack
                                paddingVertical="$1"
                                paddingHorizontal="$3"
                                borderRadius="$2"
                                backgroundColor={isSelected ? "$accent" : "$surface3"}
                              >
                                <AppText
                                  variant="caption"
                                  fontWeight="500"
                                  color={isSelected ? "$background" : "$color"}
                                >
                                  {opt.label}
                                </AppText>
                              </YStack>
                            </Pressable>
                          );
                        })}
                      </XStack>
                    </YStack>

                    {symptomError && (
                      <AppText variant="caption" color="$error">
                        {symptomError}
                      </AppText>
                    )}

                    <AppButton
                      variant="secondary"
                      size="sm"
                      loading={savingSymptom}
                      disabled={savingSymptom || !hasAnySymptom}
                      onPress={handleSaveSymptom}
                    >
                      Spara symtom
                    </AppButton>
                  </YStack>
                </Card.Content>
              </Card>
            </Section>
          </>
        )}
      </YStack>
    </Screen>
  );
}
