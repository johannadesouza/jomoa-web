/**
 * CycleModeSettingsSection – radio group for cycle mode selection.
 * Profilmedveten: man ser "Ingen cykelspårning", kvinna/annat ser "Utebliven mens".
 */
import React, { useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { YStack, XStack } from "tamagui";
import { AppText, AppButton, AppIcon, Card, Section } from "../../shared/ui";
import { useCycleContext } from "../../shared/context/CycleContext";
import { useAppCopy, getAppCopy } from "../../lib/hooks/useAppCopy";
import type { CycleMode } from "../../lib/utils/cycleEngine";

const MODES_BASE: { value: CycleMode; labelKey: string; descKey: string | null }[] = [
  { value: "regular", labelKey: "Vanlig cykel", descKey: null },
  { value: "missing_period", labelKey: "cycle_mode_missing_label", descKey: "cycle_mode_missing_desc" },
  { value: "perimenopause", labelKey: "Peri-/menopaus", descKey: null },
];

const FALLBACK_DESC: Record<CycleMode, string> = {
  regular: "Cykelfaser, tips och träningsanpassning baserat på menscykeln.",
  missing_period: "Inga faser visas. Fokus på energibalans och återhämtning.",
  perimenopause: "Inga faser. Symtomincheckningar och styrketräning som bas.",
};

export function CycleModeSettingsSection() {
  const { mode, updateMode } = useCycleContext();
  const copy = useAppCopy("sv");
  const [infoVisible, setInfoVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (newMode: CycleMode) => {
    if (newMode === mode) return;
    setSaving(true);
    await updateMode(newMode);
    setSaving(false);
  };

  return (
    <>
      <Section
        title="Cykelläge"
        subtitle="Välj det läge som passar dig bäst"
        viewAllLabel="Vad är detta?"
        onViewAll={() => setInfoVisible(true)}
      >
        <Card>
          <Card.Content>
            <YStack gap="$3">
              {MODES_BASE.map((m) => {
                const isActive = mode === m.value;
                const label =
                  m.labelKey === "cycle_mode_missing_label"
                    ? getAppCopy(copy, m.labelKey, "Utebliven mens")
                    : m.labelKey as string;
                const desc =
                  m.descKey != null
                    ? getAppCopy(copy, m.descKey, FALLBACK_DESC[m.value])
                    : FALLBACK_DESC[m.value];
                return (
                  <Pressable
                    key={m.value}
                    onPress={() => handleSelect(m.value)}
                    disabled={saving}
                  >
                    <XStack
                      gap="$3"
                      alignItems="center"
                      paddingVertical="$2"
                      opacity={saving ? 0.6 : 1}
                    >
                      {/* Radio indicator */}
                      <XStack
                        width={22}
                        height={22}
                        borderRadius={11}
                        borderWidth={2}
                        borderColor={isActive ? "$accent" : "$borderSoft"}
                        backgroundColor={isActive ? "$accent" : "transparent"}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {isActive && (
                          <XStack
                            width={10}
                            height={10}
                            borderRadius={5}
                            backgroundColor="$background"
                          />
                        )}
                      </XStack>

                      <YStack flex={1} gap="$0.5">
                        <AppText variant="body" fontWeight={isActive ? "700" : "400"}>
                          {label}
                        </AppText>
                        <AppText variant="caption" muted>
                          {desc}
                        </AppText>
                      </YStack>
                    </XStack>
                  </Pressable>
                );
              })}
            </YStack>
          </Card.Content>
        </Card>
      </Section>

      <CycleModeInfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
      />
    </>
  );
}

// ─── Info Modal ───────────────────────────────────────────────────────────────

interface CycleModeInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CycleModeInfoModal({ visible, onClose }: CycleModeInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <YStack
            backgroundColor="$card"
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            padding="$6"
            gap="$4"
            maxHeight="80%"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <AppText variant="h3">Om cykellägen</AppText>
              <Pressable onPress={onClose} hitSlop={12}>
                <AppIcon name="close-outline" size={24} />
              </Pressable>
            </XStack>

            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4">
                <InfoBlock
                  title="Vanlig cykel"
                  body="Passar dig som har regelbundna perioder. Appen beräknar var i cykeln du är och anpassar träningsrekommendationer efter fas – mens, follikulär, ägglossning och luteal."
                />
                <InfoBlock
                  title="Utebliven mens"
                  body="Passar dig som inte haft mens på ett tag. Utebliven mens kan ha många orsaker och är inte alltid ett problem – men kan ibland signalera låg energitillgänglighet. Träningsanpassningen baseras istället på din dagsform och historik. Inga medicinska råd ges."
                />
                <InfoBlock
                  title="Peri-/menopaus"
                  body="Passar dig som är i en övergångsfas. Styrketräning är ett av de mest välstödda redskapen i den här fasen. Du kan checka in symtom som värmevallningar, sömnproblem och ledvärk, och rekommendationerna anpassas efter det."
                />

                <AppText variant="caption" muted>
                  Appen ger inga medicinska diagnoser eller råd. Kontakta alltid läkare vid hälsofrågor.
                </AppText>
              </YStack>
            </ScrollView>

            <AppButton variant="primary" fullWidth onPress={onClose}>
              Stäng
            </AppButton>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <YStack gap="$1">
      <AppText variant="body" fontWeight="600">{title}</AppText>
      <AppText variant="small" muted>{body}</AppText>
    </YStack>
  );
}
