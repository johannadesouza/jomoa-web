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

  const handleLogPeriod = async (dateStr: string) => {
    if (!client?.id || !dateStr) return;
    setSaving(true);
    const { success } = await savePeriodStart(client.id, dateStr);
    setSaving(false);
    if (success) {
      setCustomDate("");
      setShowCustom(false);
      await refetch();
    }
  };

  const handleLogPeriodToday = () => {
    handleLogPeriod(new Date().toISOString().split("T")[0]);
  };

  const handleLogCustomDate = () => {
    const match = customDate.match(/^\d{4}-\d{2}-\d{2}$/);
    if (match) handleLogPeriod(customDate);
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
                    <AppInput
                      label="Datum (ÅÅÅÅ-MM-DD)"
                      placeholder="t.ex. 2025-02-15"
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

            <Section title="Symtom idag" spacing="md">
              <Card>
                <Card.Content>
                  <YStack gap="$3">
                    <XStack gap="$3">
                      <YStack flex={1} gap="$1">
                        <AppText variant="small" muted>
                          Kramper (1–5)
                        </AppText>
                        <AppInput
                          placeholder="1–5"
                          keyboardType="number-pad"
                          value={symptomCramps}
                          onChangeText={setSymptomCramps}
                        />
                      </YStack>
                      <YStack flex={1} gap="$1">
                        <AppText variant="small" muted>
                          Energi (1–10)
                        </AppText>
                        <AppInput
                          placeholder="1–10"
                          keyboardType="number-pad"
                          value={symptomEnergy}
                          onChangeText={setSymptomEnergy}
                        />
                      </YStack>
                    </XStack>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onPress={async () => {
                        const today = new Date().toISOString().split("T")[0];
                        const cramps = parseInt(symptomCramps, 10);
                        const energy = parseInt(symptomEnergy, 10);
                        await logSymptom({
                          date: today,
                          cramps_severity:
                            !isNaN(cramps) && cramps >= 1 && cramps <= 5
                              ? cramps
                              : null,
                          energy_level:
                            !isNaN(energy) && energy >= 1 && energy <= 10
                              ? energy
                              : null,
                        });
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
