/**
 * Modal för att skapa eller redigera ett mål
 * JOMOA-stil – fördefinierade alternativ per typ
 */
import React, { useState, useEffect } from "react";
import { Modal, ScrollView, Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText, AppButton, AppIcon, type AppIconName } from "../../shared/ui";
import {
  getGoalTypeLabel,
  type ClientGoal,
  type GoalType,
} from "../../lib/services/goalsService";
import {
  GOAL_OPTIONS,
  GOAL_SELECT_LIMITS,
} from "../../lib/data/goalOptions";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";

const GOAL_TYPES: GoalType[] = ["fitness", "nutrition", "wellness", "event"];

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    goalType: GoalType,
    description?: string | null,
    targetValue?: string | null
  ) => Promise<{ error: Error | null }>;
  initialGoal?: ClientGoal | null;
  initialGoalType?: GoalType;
  onUpdate?: (
    goalId: string,
    updates: { description?: string | null; target_value?: string | null }
  ) => Promise<{ error: Error | null }>;
  onDelete?: (goalId: string) => Promise<{ error: Error | null }>;
}

function parseSelectedFromGoal(goal: ClientGoal | null): string[] {
  if (!goal?.target_value) return [];
  return goal.target_value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AddGoalModal({
  visible,
  onClose,
  onSave,
  initialGoal = null,
  initialGoalType,
  onUpdate,
  onDelete,
}: AddGoalModalProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const isEdit = !!initialGoal && !!onUpdate;

  const [step, setStep] = useState<"type" | "options">("type");
  const [goalType, setGoalType] = useState<GoalType>(
    initialGoal?.goal_type ?? initialGoalType ?? "fitness"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = GOAL_OPTIONS[goalType];
  const limit = GOAL_SELECT_LIMITS[goalType];
  const isMulti = limit > 1;

  useEffect(() => {
    if (visible) {
      const type = initialGoal?.goal_type ?? initialGoalType ?? "fitness";
      setGoalType(type);
      setSelectedIds(parseSelectedFromGoal(initialGoal));
      setStep(initialGoalType || initialGoal ? "options" : "type");
      setError(null);
    }
  }, [visible, initialGoal?.target_value, initialGoalType, initialGoal?.goal_type]);

  const toggleOption = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= limit) return prev;
      return [...prev, id];
    });
    setError(null);
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      setError("Välj minst ett alternativ");
      return;
    }

    setSaving(true);
    setError(null);

    const targetValue = selectedIds.join(",");
    const labels = selectedIds
      .map((id) => options.find((o) => o.id === id)?.label)
      .filter(Boolean);
    const description = labels.join(", ");

    if (isEdit && initialGoal) {
      const { error: updateError } = await onUpdate!(initialGoal.id, {
        description: description || null,
        target_value: targetValue || null,
      });
      setSaving(false);
      if (updateError) {
        setError(updateError.message ?? "Kunde inte spara");
        return;
      }
    } else {
      const { error: saveError } = await onSave(
        goalType,
        description || null,
        targetValue || null
      );
      setSaving(false);
      if (saveError) {
        setError(saveError.message ?? "Kunde inte spara");
        return;
      }
    }

    onClose();
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  const instructionText =
    goalType === "fitness"
      ? "Välj upp till 2 träningsmål så vi kan rekommendera rätt program."
      : goalType === "nutrition"
        ? "Välj ditt näringsmål så vi kan anpassa rekommendationer."
        : goalType === "wellness"
          ? "Välj upp till 3 hälsomål för kropp och sinnet."
          : "Har du ett speciellt event framför dig? Välj för att hålla dig motiverad.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <YStack
            backgroundColor="$card"
            borderRadius="$4"
            padding="$6"
            width="100%"
            maxWidth={360}
            borderWidth={1}
            borderColor="$borderSoft"
            gap="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <AppText variant="h2" color="$accent">
                {isEdit
                  ? "Redigera mål"
                  : step === "type"
                    ? "Välj typ av mål"
                    : getGoalTypeLabel(goalType)}
              </AppText>
              <Pressable onPress={handleClose} hitSlop={12} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </XStack>

            {step === "type" ? (
              <YStack gap="$3">
                {GOAL_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setGoalType(t);
                      setSelectedIds([]);
                      setStep("options");
                    }}
                  >
                    <XStack
                      backgroundColor="$surface3"
                      borderRadius="$3"
                      padding="$4"
                      alignItems="center"
                      gap="$3"
                      borderWidth={1}
                      borderColor="$borderSoft"
                    >
                      <YStack
                        width={44}
                        height={44}
                        borderRadius="$full"
                        backgroundColor="$background"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppIcon
                          name={
                            (t === "fitness"
                              ? "barbell-outline"
                              : t === "nutrition"
                                ? "nutrition-outline"
                                : t === "wellness"
                                  ? "heart-outline"
                                  : "calendar-outline") as "barbell-outline"
                          }
                          size={22}
                        />
                      </YStack>
                      <AppText variant="body" fontWeight="500" flex={1}>
                        {getGoalTypeLabel(t)}
                      </AppText>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </XStack>
                  </Pressable>
                ))}
                <AppButton variant="ghost" onPress={handleClose} marginTop="$2">
                  Avbryt
                </AppButton>
              </YStack>
            ) : (
              <>
                <AppText variant="small" color="$colorSecondary">
                  {instructionText}
                </AppText>

                <ScrollView
                  style={{ maxHeight: 320 }}
                  showsVerticalScrollIndicator={false}
                >
                  <YStack gap="$2">
                    {options.map((opt) => {
                      const isSelected = selectedIds.includes(opt.id);
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => toggleOption(opt.id)}
                        >
                          <XStack
                            backgroundColor={
                              isSelected ? "$surface3" : "$background"
                            }
                            borderRadius="$3"
                            padding="$4"
                            alignItems="center"
                            gap="$3"
                            borderWidth={1}
                            borderColor={
                              isSelected ? "$accent" : "$borderSoft"
                            }
                          >
                            <YStack
                              width={40}
                              height={40}
                              borderRadius="$full"
                              backgroundColor="$surface3"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <AppIcon
                                name={opt.iconName as AppIconName}
                                size={20}
                                color={isSelected ? colors.accent : undefined}
                              />
                            </YStack>
                            <AppText
                              variant="body"
                              fontWeight={isSelected ? "600" : "400"}
                              flex={1}
                              color={isSelected ? "$accent" : undefined}
                            >
                              {opt.label}
                            </AppText>
                            {isMulti ? (
                              <YStack
                                width={24}
                                height={24}
                                borderRadius="$full"
                                borderWidth={2}
                                borderColor={
                                  isSelected ? "$accent" : "$borderSoft"
                                }
                                backgroundColor={
                                  isSelected ? "$accent" : "transparent"
                                }
                                alignItems="center"
                                justifyContent="center"
                              >
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="#FFFBF8"
                                  />
                                )}
                              </YStack>
                            ) : (
                              isSelected && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color={colors.accent}
                                />
                              )
                            )}
                          </XStack>
                        </Pressable>
                      );
                    })}
                  </YStack>
                </ScrollView>

                {error ? (
                  <AppText variant="caption" color="$error">
                    {error}
                  </AppText>
                ) : null}

                <XStack gap="$3">
                  <AppButton
                    variant="secondary"
                    flex={1}
                    onPress={() => setStep("type")}
                    disabled={saving}
                  >
                    Tillbaka
                  </AppButton>
                  <AppButton
                    variant="primary"
                    flex={1}
                    onPress={handleSave}
                    loading={saving}
                    disabled={saving}
                  >
                    Spara
                  </AppButton>
                </XStack>

                {isEdit && onDelete && initialGoal && (
                  <AppButton
                    variant="ghost"
                    fullWidth
                    onPress={async () => {
                      setSaving(true);
                      const { error: delError } = await onDelete(initialGoal.id);
                      setSaving(false);
                      if (!delError) onClose();
                      else setError(delError.message ?? "Kunde inte ta bort");
                    }}
                    disabled={saving}
                  >
                    Ta bort mål
                  </AppButton>
                )}
              </>
            )}
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
