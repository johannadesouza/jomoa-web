import React, { useState, useEffect } from "react";
import { YStack } from "tamagui";
import { useNavigation } from "@react-navigation/native";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppInput,
  LoadingScreen,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useReadiness } from "../../lib/hooks/useReadiness";
import { useCycle } from "../../lib/hooks/useCycle";
import { saveReadiness } from "../../lib/services/readinessService";
import { getLocalDateString } from "../../lib/utils/date";

function clamp(value: string, min: number, max: number): number | null {
  const n = parseFloat(value);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function ReadinessScreen() {
  const navigation = useNavigation();
  const { client } = useAuth();
  const { readiness, isLoading, refetch } = useReadiness(client?.id);
  const { phaseLabel } = useCycle(client?.id);

  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [soreness, setSoreness] = useState("");

  useEffect(() => {
    if (readiness) {
      setSleepHours(readiness.sleep_hours?.toString() ?? "");
      setSleepQuality(readiness.sleep_quality?.toString() ?? "");
      setStressLevel(readiness.stress_level?.toString() ?? "");
      setEnergyLevel(readiness.energy_level?.toString() ?? "");
      setSoreness(readiness.soreness?.toString() ?? "");
    }
  }, [readiness]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!client?.id) return;
    setSaving(true);
    setSaveError(null);
    const { success, error } = await saveReadiness({
      client_id: client.id,
      date: getLocalDateString(),
      sleep_hours: clamp(sleepHours, 0, 24),
      sleep_quality: clamp(sleepQuality, 1, 10),
      stress_level: clamp(stressLevel, 1, 10),
      energy_level: clamp(energyLevel, 1, 10),
      soreness: clamp(soreness, 1, 10),
    });
    setSaving(false);
    if (success) {
      refetch();
      navigation.goBack();
    } else {
      setSaveError(error ?? "Kunde inte spara");
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <Section title="Hur mår du idag?">
          <YStack gap="$2">
            {phaseLabel && phaseLabel !== "Okänd" && (
              <AppText variant="small" color="$accent">
                Cykelfas: {phaseLabel}
              </AppText>
            )}
            <AppText variant="small" muted>
              Skala 1–10. 1 = mycket lågt, 10 = mycket bra (för sömn/energi) eller
              mycket högt (för stress/ömhet).
            </AppText>
          </YStack>
        </Section>

        <Section title="Check-in">
          <Card>
            <Card.Content>
              <YStack gap="$4">
                <AppInput
                  label="Sömntimmar"
                  placeholder="t.ex. 7"
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  keyboardType="decimal-pad"
                />
                <AppInput
                  label="Sömnkvalitet (1–10)"
                  placeholder="1–10"
                  value={sleepQuality}
                  onChangeText={setSleepQuality}
                  keyboardType="number-pad"
                />
                <AppInput
                  label="Stress (1–10)"
                  placeholder="1–10"
                  value={stressLevel}
                  onChangeText={setStressLevel}
                  keyboardType="number-pad"
                />
                <AppInput
                  label="Energi (1–10)"
                  placeholder="1–10"
                  value={energyLevel}
                  onChangeText={setEnergyLevel}
                  keyboardType="number-pad"
                />
                <AppInput
                  label="Ömhet (1–10)"
                  placeholder="1–10"
                  value={soreness}
                  onChangeText={setSoreness}
                  keyboardType="number-pad"
                />
                <AppButton
                  variant="primary"
                  fullWidth
                  onPress={handleSave}
                  loading={saving}
                >
                  Spara
                </AppButton>
                {saveError && (
                  <AppText variant="small" color="$error">
                    {saveError}
                  </AppText>
                )}
              </YStack>
            </Card.Content>
          </Card>
        </Section>
      </YStack>
    </Screen>
  );
}
