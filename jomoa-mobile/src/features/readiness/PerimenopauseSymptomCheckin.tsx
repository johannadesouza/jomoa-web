/**
 * PerimenopauseSymptomCheckin – optional symptom logging for perimenopause mode.
 * Four bool toggles saved to cycle_symptoms.
 */
import React, { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import { AppText, AppButton, Card, Section } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useAppNow } from "../../shared/context/AppNowContext";
import {
  savePerimenopauseSymptoms,
  getTodayPerimenopauseSymptoms,
  type PerimenopauseSymptoms,
} from "../../lib/services/cycleEngineService";

const SYMPTOM_OPTIONS: { key: keyof PerimenopauseSymptoms; label: string; desc: string }[] = [
  { key: "hot_flashes",      label: "Värmevallningar",   desc: "Plötslig värmekänsla" },
  { key: "sleep_disruption", label: "Sömnproblem",       desc: "Svårt att sova eller vakna tidigt" },
  { key: "joint_stiffness",  label: "Ledvärk",           desc: "Stelhet eller ömhet i leder" },
  { key: "energy_crash",     label: "Energikrasch",      desc: "Onormal trötthet under dagen" },
];

export function PerimenopauseSymptomCheckin() {
  const { client } = useAuth();
  const appNow = useAppNow();
  const [symptoms, setSymptoms] = useState<PerimenopauseSymptoms>({
    hot_flashes: false,
    sleep_disruption: false,
    joint_stiffness: false,
    energy_crash: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load today's existing symptoms
  useEffect(() => {
    if (!client?.id) return;
    getTodayPerimenopauseSymptoms(client.id, appNow.todayString()).then((data) => {
      if (data) setSymptoms(data);
    });
  }, [client?.id, appNow]);

  const toggle = (key: keyof PerimenopauseSymptoms) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!client?.id) return;
    setSaving(true);
    const result = await savePerimenopauseSymptoms(client.id, symptoms, appNow.todayString());
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
  };

  const hasAny = Object.values(symptoms).some(Boolean);

  return (
    <Section
      title="Symtom idag"
      subtitle="Hjälper anpassa träningsrekommendationer"
    >
      <Card>
        <Card.Content>
          <YStack gap="$3">
            <AppText variant="caption" muted>
              Markera om du upplever något av dessa idag (valfritt)
            </AppText>

            <XStack flexWrap="wrap" gap="$2">
              {SYMPTOM_OPTIONS.map((opt) => {
                const active = symptoms[opt.key];
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => toggle(opt.key)}
                  >
                    <YStack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor={active ? "$accent" : "$borderSoft"}
                      backgroundColor={active ? "$accentSubtle" : "transparent"}
                      gap="$0.5"
                      minWidth={140}
                    >
                      <AppText
                        variant="small"
                        fontWeight={active ? "700" : "400"}
                        color={active ? "$accent" : "$color"}
                      >
                        {opt.label}
                      </AppText>
                      <AppText variant="caption" muted>
                        {opt.desc}
                      </AppText>
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>

            {error && (
              <AppText variant="caption" color="$error">
                {error}
              </AppText>
            )}

            {saved && (
              <AppText variant="caption" color="$success">
                Sparat!
              </AppText>
            )}

            <AppButton
              variant="secondary"
              size="sm"
              loading={saving}
              disabled={saving}
              onPress={handleSave}
            >
              {hasAny ? "Spara symtom" : "Inga symtom idag"}
            </AppButton>

            <AppText variant="caption" muted>
              Styrketräning är ett av de mest välstödda redskapen i den här fasen. Vi anpassar baserat på sömn och symtom.
            </AppText>
          </YStack>
        </Card.Content>
      </Card>
    </Section>
  );
}
