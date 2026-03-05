/**
 * ScenarioScreen – __DEV__ only. Sätt "idag", fas och readiness för test.
 */
import React, { useState } from "react";
import { TextInput } from "react-native";
import { YStack, XStack } from "tamagui";
import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
} from "../../shared/ui";
import { useAppNow } from "../../shared/context/AppNowContext";
import { useScenario } from "../../shared/context/ScenarioContext";
import { getPhaseLabel } from "../../lib/utils/cycleUtils";
import type { CyclePhase } from "../../lib/utils/cycleUtils";

const PHASES: { id: Exclude<CyclePhase, null>; label: string }[] = [
  { id: "menstruation", label: "Mens" },
  { id: "follicular", label: "Follikulär" },
  { id: "ovulation", label: "Ägglossning" },
  { id: "luteal", label: "Luteal" },
];

export function ScenarioScreen() {
  const appNow = useAppNow();
  const scenario = useScenario();
  const [dateInput, setDateInput] = useState(appNow.todayString());

  const handleSetToday = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      appNow.setTodayOverride(dateInput);
    }
  };

  const handleClearToday = () => {
    appNow.setTodayOverride(null);
    setDateInput(appNow.todayString());
  };

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <AppText variant="h2">Scenario (dev)</AppText>
        <AppText variant="small" muted>
          Överskrida värden för att testa olika tillstånd. Rensa när du är klar.
        </AppText>

        <Section title="Idag (YYYY-MM-DD)">
          <Card>
            <Card.Content>
              <AppText variant="small" muted>
                Nu: {appNow.todayString()}
              </AppText>
              <TextInput
                value={dateInput}
                onChangeText={setDateInput}
                placeholder="2025-03-15"
                placeholderTextColor="#888"
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#444",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 16,
                }}
              />
              <XStack gap="$2" marginTop="$3">
                <AppButton
                  variant="secondary"
                  flex={1}
                  onPress={handleSetToday}
                >
                  Sätt idag
                </AppButton>
                <AppButton variant="secondary" onPress={handleClearToday}>
                  Rensa
                </AppButton>
              </XStack>
            </Card.Content>
          </Card>
        </Section>

        <Section title="Fas (override)">
          <Card>
            <Card.Content>
              <AppText variant="small" muted>
                Visas som: {scenario.phaseOverride ? getPhaseLabel(scenario.phaseOverride) : "—"}
              </AppText>
              <YStack gap="$2" marginTop="$3">
                {PHASES.map(({ id, label }) => (
                  <XStack key={id} gap="$2">
                    <AppButton
                      variant={scenario.phaseOverride === id ? "primary" : "secondary"}
                      size="small"
                      onPress={() => scenario.setPhaseOverride(id)}
                    >
                      {label}
                    </AppButton>
                  </XStack>
                ))}
                <AppButton
                  variant="secondary"
                  size="small"
                  onPress={() => scenario.setPhaseOverride(null)}
                >
                  Rensa fas
                </AppButton>
              </YStack>
            </Card.Content>
          </Card>
        </Section>

        <Section title="Readiness (override, 0–100)">
          <Card>
            <Card.Content>
              <AppText variant="small" muted>
                Visas som score: {scenario.readinessOverride ?? "—"}
              </AppText>
              <XStack gap="$2" marginTop="$3" flexWrap="wrap">
                {[25, 50, 75, 100].map((n) => (
                  <AppButton
                    key={n}
                    variant={scenario.readinessOverride === n ? "primary" : "secondary"}
                    size="small"
                    onPress={() => scenario.setReadinessOverride(n)}
                  >
                    {n}
                  </AppButton>
                ))}
                <AppButton
                  variant="secondary"
                  size="small"
                  onPress={() => scenario.setReadinessOverride(null)}
                >
                  Rensa
                </AppButton>
              </XStack>
            </Card.Content>
          </Card>
        </Section>
      </YStack>
    </Screen>
  );
}
