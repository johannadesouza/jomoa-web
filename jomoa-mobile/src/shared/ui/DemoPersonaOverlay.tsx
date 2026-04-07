import React, { useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { XStack, YStack } from "tamagui";

import { isDemoMode } from "../../lib/demo/demoMode";
import { useDemoPersona } from "../context/DemoPersonaContext";
import { AppButton } from "./AppButton";
import { AppIcon } from "./AppIcon";
import { AppText } from "./AppText";
import { Card } from "./Card";

type PersonaOption = {
  id: "strength_3x" | "cycle_only" | "perimenopause";
  label: string;
  subtitle: string;
};

const OPTIONS: PersonaOption[] = [
  { id: "strength_3x", label: "Strength 3x/vecka", subtitle: "Full onboarding · Mål styrka · M/W/F" },
  { id: "cycle_only", label: "Cycle-only", subtitle: "Cykel-fokus · Förenklad navigation" },
  { id: "perimenopause", label: "Perimenopause", subtitle: "Irreguljär cykel · Peri-/menopaus" },
];

function personaLabel(p: PersonaOption["id"]): string {
  const opt = OPTIONS.find((o) => o.id === p);
  return opt?.label ?? p;
}

export function DemoPersonaOverlay() {
  const demo = useDemoPersona();
  const [open, setOpen] = useState(false);

  const enabled = isDemoMode() && demo.isReady;
  const current = demo.persona;

  const subtitle = useMemo(() => {
    if (!enabled) return "";
    return `Persona: ${personaLabel(current)}`;
  }, [enabled, current]);

  if (!enabled) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          zIndex: 9999,
        }}
        accessibilityRole="button"
        accessibilityLabel="Öppna demo persona-väljare"
      >
        <XStack
          alignItems="center"
          gap="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$10"
          backgroundColor="$accent"
          borderWidth={1}
          borderColor="$accent"
        >
          <AppIcon name="swap-horizontal-outline" size={18} color="$background" />
          <AppText variant="caption" color="$background" fontWeight="700">
            Persona
          </AppText>
        </XStack>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
          accessibilityRole="button"
          accessibilityLabel="Stäng"
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ padding: 16 }}>
            <Card>
              <Card.Content>
                <YStack gap="$3">
                  <YStack gap="$1">
                    <AppText variant="h3">Demo</AppText>
                    <AppText variant="small" muted>
                      Read-only portfolio demo. Byt persona för att se personalisering.
                    </AppText>
                    <AppText variant="caption" color="$colorSecondary">
                      {subtitle}
                    </AppText>
                  </YStack>

                  <YStack gap="$2">
                    {OPTIONS.map((o) => (
                      <AppButton
                        key={o.id}
                        variant={current === o.id ? "primary" : "secondary"}
                        size="sm"
                        fullWidth
                        onPress={async () => {
                          await demo.setPersona(o.id);
                          setOpen(false);
                        }}
                      >
                        {o.label}
                      </AppButton>
                    ))}
                  </YStack>

                  <XStack justifyContent="flex-end">
                    <AppButton variant="secondary" size="sm" onPress={() => setOpen(false)}>
                      Stäng
                    </AppButton>
                  </XStack>
                </YStack>
              </Card.Content>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

