import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppInput,
  EmptyState,
  ErrorState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useCycle } from "../../lib/hooks/useCycle";
import { useCyclePhase } from "../../lib/hooks/useCyclePhase";
import { savePeriodStart } from "../../lib/services/cycleService";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PHASES: { key: string; label: string }[] = [
  { key: "menstruation", label: "Mens" },
  { key: "follicular", label: "Follikulär" },
  { key: "ovulation", label: "Ägglossning" },
  { key: "luteal", label: "Luteal" },
];

export function CycleScreen() {
  const { client } = useAuth();
  const {
    latestPeriodStart,
    phase,
    phaseLabel,
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

  if (isLoading) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Laddar...
        </AppText>
      </Screen>
    );
  }

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
            <YStack gap="$4">
              <Card>
                <Card.Content>
                  <YStack gap="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <AppText variant="h3">Nuvarande fas</AppText>
                      <AppText
                        variant="body"
                        fontWeight="600"
                        color="$accent"
                      >
                        {phaseLabel}
                      </AppText>
                    </XStack>
                    <AppText variant="small" muted>
                      Dag {cycleDay} i cykeln · Senast:{" "}
                      {formatDate(latestPeriodStart)}
                    </AppText>
                    <XStack gap="$1" marginTop="$2">
                      {PHASES.map((p) => (
                        <YStack
                          key={p.key}
                          flex={1}
                          paddingVertical="$2"
                          backgroundColor={
                            phase === p.key ? "$accent" : "$surface3"
                          }
                          borderRadius="$1"
                          alignItems="center"
                        >
                          <Text
                            fontSize="$xs"
                            color={phase === p.key ? "$background" : "$color"}
                            fontWeight={phase === p.key ? "600" : "400"}
                          >
                            {p.label}
                          </Text>
                        </YStack>
                      ))}
                    </XStack>
                  </YStack>
                </Card.Content>
              </Card>

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

              <Section title="Symtom idag">
                <Card>
                  <Card.Content>
                    <YStack gap="$3">
                      <YStack gap="$1">
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
                      <YStack gap="$1">
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
            </YStack>
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
      </YStack>
    </Screen>
  );
}
