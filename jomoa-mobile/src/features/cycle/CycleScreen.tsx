import React, { useState } from "react";
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
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { useCyclePhase } from "../../lib/hooks/useCyclePhase";
import { savePeriodStart } from "../../lib/services/cycleService";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { CycleHeroCard } from "../insights/CycleHeroCard";
import { CycleCategoryStrip } from "../../components/cycle/CycleCategoryStrip";
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
    latestPeriodStart,
    phase,
    cycleDay,
    cycleLength,
    daysUntilNextPeriod,
    isLoading,
    error,
    refetch,
  } = useCycle(client?.id);

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

  const handleLogPeriod = async (dateStr: string) => {
    if (!client?.id || !dateStr) return;
    setSaving(true);
    setPeriodError(null);
    const { success, error: saveErr } = await savePeriodStart(client.id, dateStr);
    setSaving(false);
    if (success) {
      setCustomDate("");
      setShowCustom(false);
      await refetch();
    } else {
      setPeriodError(saveErr ?? "Kunde inte spara");
    }
  };

  const handleLogPeriodToday = () => {
    handleLogPeriod(new Date().toISOString().split("T")[0]);
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
    return d.toISOString().split("T")[0];
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
    const today = new Date().toISOString().split("T")[0];
    const { error } = await logSymptom({
      date: today,
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
        <Section title="Din cykel">
          {latestPeriodStart ? (
            <>
              <CycleHeroCard
                phase={phase}
                cycleDay={cycleDay}
                cycleLength={cycleLength}
                daysUntilNextPeriod={daysUntilNextPeriod}
                onPress={() => navigation.navigate("CycleInsights", {})}
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
                        {BLEEDING_OPTIONS.map((opt) => {
                          const isSelected = symptomBleeding === opt.value;
                          return (
                            <Pressable
                              key={opt.value}
                              onPress={() => {
                                setSymptomBleeding(isSelected ? null : opt.value);
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
                        {MOOD_OPTIONS.map((opt) => {
                          const isSelected = symptomMood === opt.id;
                          return (
                            <Pressable
                              key={opt.id}
                              onPress={() => {
                                setSymptomMood(isSelected ? null : opt.id);
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
                        {CRAVINGS_OPTIONS.map((opt) => {
                          const isSelected = symptomCravings === opt.id;
                          return (
                            <Pressable
                              key={opt.id}
                              onPress={() => {
                                setSymptomCravings(isSelected ? null : opt.id);
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
