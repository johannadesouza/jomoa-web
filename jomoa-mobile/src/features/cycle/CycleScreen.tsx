import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { YStack, XStack, Text } from "tamagui";

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
import { PHASE_KNOWLEDGE_COPY } from "../../lib/data/phaseKnowledgeCopy";
import { PhaseCardCarousel } from "../../components/cycle/PhaseCardCarousel";

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

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Menscykel">
          {latestPeriodStart ? (
            <>
              <PhaseCardCarousel
                activePhase={phase}
                cycleDay={cycleDay}
                onPhasePress={() => navigation.navigate("CycleInsights")}
              />
              <Card
                pressable
                onPress={() => navigation.navigate("CycleInsights")}
              >
                <Card.Content>
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack gap="$1">
                      <AppText variant="small" muted>
                        Senast: {formatDate(latestPeriodStart)}
                      </AppText>
                      <AppText variant="caption" muted>
                        {PHASE_KNOWLEDGE_COPY.cycleInsightsTitle} →
                      </AppText>
                    </YStack>
                    <AppText variant="body" color="$accent">→</AppText>
                  </XStack>
                </Card.Content>
              </Card>
            </>
          ) : (
            <Card>
              <Card.Content>
                <EmptyState
                  icon={<Text fontSize="$xxxl">🌙</Text>}
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
            <Section title="Logga period" spacing="md">
              <YStack gap="$3">
                {periodError && (
                  <AppText variant="caption" color="$error">
                    {periodError}
                  </AppText>
                )}
                <AppButton
                  variant="secondary"
                  fullWidth
                  onPress={handleLogPeriodToday}
                  loading={saving}
                >
                  Logga period start idag
                </AppButton>
                {showCustom ? (
                  <YStack gap="$2">
                    <AppText variant="caption" muted>
                      Ange datum i format ÅÅÅÅ-MM-DD
                    </AppText>
                    <AppInput
                      label="Datum"
                      placeholder="2025-02-15"
                      value={customDate}
                      onChangeText={setCustomDate}
                    />
                    <XStack gap="$2">
                      <AppButton
                        variant="secondary"
                        flex={1}
                        onPress={handleLogCustomDate}
                        loading={saving}
                      >
                        Spara
                      </AppButton>
                      <AppButton
                        variant="ghost"
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
                    fullWidth
                    onPress={() => setShowCustom(true)}
                  >
                    Logga annat datum
                  </AppButton>
                )}
              </YStack>
            </Section>

            <Section
              title="Symtom idag"
              subtitle="Kramper och energi – hjälper oss anpassa rekommendationer"
              spacing="md"
            >
              <Card>
                <Card.Content>
                  <YStack gap="$3">
                    <XStack gap="$3">
                      <YStack flex={1} gap="$1">
                        <AppText variant="small" muted>
                          Kramper (1–5, 5 = värst)
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
                        <AppText variant="small" muted>
                          Energi (1–10, 10 = mest)
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
                    {symptomError && (
                      <AppText variant="caption" color="$error">
                        {symptomError}
                      </AppText>
                    )}
                    <AppButton
                      variant="secondary"
                      size="sm"
                      loading={savingSymptom}
                      disabled={savingSymptom}
                      onPress={async () => {
                        const cramps = parseInt(symptomCramps, 10);
                        const energy = parseInt(symptomEnergy, 10);
                        const hasCramps =
                          !isNaN(cramps) && cramps >= 1 && cramps <= 5;
                        const hasEnergy =
                          !isNaN(energy) && energy >= 1 && energy <= 10;
                        if (!hasCramps && !hasEnergy) {
                          setSymptomError("Fyll i minst ett fält (1–5 eller 1–10)");
                          return;
                        }
                        setSavingSymptom(true);
                        setSymptomError(null);
                        const today = new Date().toISOString().split("T")[0];
                        const { error } = await logSymptom({
                          date: today,
                          cramps_severity: hasCramps ? cramps : null,
                          energy_level: hasEnergy ? energy : null,
                        });
                        setSavingSymptom(false);
                        if (error) {
                          setSymptomError(error.message ?? "Kunde inte spara");
                          return;
                        }
                        setSymptomCramps("");
                        setSymptomEnergy("");
                      }}
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
