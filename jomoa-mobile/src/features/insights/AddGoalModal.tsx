/**
 * Modal för att skapa eller redigera ett mål
 */
import React, { useState, useEffect } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { YStack, XStack } from "tamagui";

import { AppText, AppButton, AppInput } from "../../shared/ui";
import {
  getGoalTypeLabel,
  type ClientGoal,
  type GoalType,
} from "../../lib/services/goalsService";

const GOAL_TYPES: GoalType[] = ["fitness", "nutrition", "wellness", "event"];

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    goalType: GoalType,
    description?: string | null,
    targetValue?: string | null
  ) => Promise<{ error: Error | null }>;
  /** Om satt, redigeringsläge */
  initialGoal?: ClientGoal | null;
  onUpdate?: (
    goalId: string,
    updates: { description?: string | null; target_value?: string | null }
  ) => Promise<{ error: Error | null }>;
  onDelete?: (goalId: string) => Promise<{ error: Error | null }>;
}

export function AddGoalModal({
  visible,
  onClose,
  onSave,
  initialGoal = null,
  onUpdate,
  onDelete,
}: AddGoalModalProps) {
  const isEdit = !!initialGoal && !!onUpdate;
  const [goalType, setGoalType] = useState<GoalType>(
    initialGoal?.goal_type ?? "fitness"
  );
  const [description, setDescription] = useState(
    initialGoal?.description ?? ""
  );
  const [targetValue, setTargetValue] = useState(
    initialGoal?.target_value ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setGoalType(initialGoal?.goal_type ?? "fitness");
      setDescription(initialGoal?.description ?? "");
      setTargetValue(initialGoal?.target_value ?? "");
      setError(null);
    }
  }, [visible, initialGoal?.goal_type, initialGoal?.description, initialGoal?.target_value]);

  const handleSave = async () => {
    const desc = description.trim();
    const target = targetValue.trim();
    if (!desc && !target) {
      setError("Fyll i minst beskrivning eller målsättning");
      return;
    }

    setSaving(true);
    setError(null);

    if (isEdit && initialGoal) {
      const { error: updateError } = await onUpdate!(initialGoal.id, {
        description: desc || null,
        target_value: target || null,
      });
      setSaving(false);
      if (updateError) {
        setError(updateError.message ?? "Kunde inte spara");
        return;
      }
    } else {
      const { error: saveError } = await onSave(
        goalType,
        desc || null,
        target || null
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose}>
          <YStack
            flex={1}
            backgroundColor="rgba(0,0,0,0.6)"
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <Pressable onPress={() => {}}>
              <YStack
                backgroundColor="$card"
                borderRadius="$4"
                padding="$6"
                width="100%"
                maxWidth={360}
                borderWidth={1}
                borderColor="$borderColor"
                gap="$4"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <AppText variant="h3">
                    {isEdit ? "Redigera mål" : "Lägg till mål"}
                  </AppText>
                  <AppButton variant="ghost" size="sm" onPress={handleClose}>
                    Avbryt
                  </AppButton>
                </XStack>

                <ScrollView
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <YStack gap="$4">
                    {!isEdit && (
                      <YStack gap="$2">
                        <AppText variant="small" fontWeight="500">
                          Typ av mål
                        </AppText>
                        <XStack flexWrap="wrap" gap="$2">
                          {GOAL_TYPES.map((t) => (
                            <AppButton
                              key={t}
                              variant={goalType === t ? "primary" : "secondary"}
                              size="sm"
                              onPress={() => setGoalType(t)}
                            >
                              {getGoalTypeLabel(t)}
                            </AppButton>
                          ))}
                        </XStack>
                      </YStack>
                    )}

                    {isEdit && (
                      <AppText variant="small" muted>
                        {getGoalTypeLabel(initialGoal!.goal_type)}
                      </AppText>
                    )}

                    <AppText variant="small" muted>
                      Beskriv ditt mål – minst ett fält krävs
                    </AppText>
                    <AppInput
                      label="Beskrivning"
                      placeholder={
                        goalType === "fitness"
                          ? "T.ex. Bli starkare i benen"
                          : goalType === "nutrition"
                            ? "T.ex. Äta mer vegetariskt"
                            : goalType === "wellness"
                              ? "T.ex. Sova 7 timmar per natt"
                              : "T.ex. Springa halvmaraton i vår"
                      }
                      value={description}
                      onChangeText={(v) => {
                        setDescription(v);
                        setError(null);
                      }}
                    />

                    <AppInput
                      label="Målsättning"
                      placeholder={
                        goalType === "fitness"
                          ? "T.ex. Bänka 60 kg"
                          : goalType === "nutrition"
                            ? "T.ex. 5 portioner grönt/dag"
                            : goalType === "wellness"
                              ? "T.ex. 3 yoga-pass/vecka"
                              : "T.ex. 2025-05-15"
                      }
                      value={targetValue}
                      onChangeText={(v) => {
                        setTargetValue(v);
                        setError(null);
                      }}
                    />

                    {error ? (
                      <AppText variant="caption" color="$error">
                        {error}
                      </AppText>
                    ) : null}
                  </YStack>
                </ScrollView>

                <AppButton
                  variant="primary"
                  fullWidth
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                >
                  {isEdit ? "Spara ändringar" : "Lägg till mål"}
                </AppButton>

                {isEdit && onDelete && initialGoal && (
                  <AppButton
                    variant="ghost"
                    fullWidth
                    marginTop="$2"
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
              </YStack>
            </Pressable>
          </YStack>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
