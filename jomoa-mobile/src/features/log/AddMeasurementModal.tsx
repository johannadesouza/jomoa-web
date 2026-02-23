/**
 * Modal för att lägga till eller redigera en mätning
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
import { getLocalDateString } from "../../lib/utils/date";
import {
  getMeasurementLabel,
  DEFAULT_MEASUREMENT_KEYS,
  type MeasurementKey,
} from "../../lib/services/measurementsService";

export interface MeasurementFormValues {
  date: string;
  measurements: Record<string, number>;
  note: string;
}

interface AddMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    date: string,
    measurements: Record<string, number>,
    note?: string | null
  ) => Promise<{ error: Error | null }>;
  /** Om satt, öppnas modalen i redigeringsläge för denna post */
  initialValues?: MeasurementFormValues | null;
}

function getUnit(key: MeasurementKey): string {
  return key === "weight" ? "kg" : "cm";
}

function parseNumber(val: string): number | null {
  const trimmed = val.trim().replace(",", ".");
  if (trimmed === "") return null;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function AddMeasurementModal({
  visible,
  onClose,
  onSave,
  initialValues = null,
}: AddMeasurementModalProps) {
  const isEdit = !!initialValues;
  const [date, setDate] = useState(initialValues?.date ?? getLocalDateString());
  const [measurements, setMeasurements] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const k of DEFAULT_MEASUREMENT_KEYS) {
      const v = initialValues?.measurements[k];
      out[k] = v != null ? String(v) : "";
    }
    return out;
  });
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDate(initialValues?.date ?? getLocalDateString());
      const out: Record<string, string> = {};
      for (const k of DEFAULT_MEASUREMENT_KEYS) {
        const v = initialValues?.measurements[k];
        out[k] = v != null ? String(v) : "";
      }
      setMeasurements(out);
      setNote(initialValues?.note ?? "");
      setError(null);
    }
  }, [visible, initialValues?.date, initialValues?.measurements, initialValues?.note]);

  const updateMeasurement = (key: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSave = async () => {
    const dateMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!dateMatch) {
      setError("Ange datum i format ÅÅÅÅ-MM-DD");
      return;
    }

    const parsed: Record<string, number> = {};
    for (const [k, v] of Object.entries(measurements)) {
      const n = parseNumber(v);
      if (n != null) parsed[k] = n;
    }

    if (Object.keys(parsed).length === 0) {
      setError("Ange minst ett mätvärde");
      return;
    }

    setSaving(true);
    setError(null);
    const { error: saveError } = await onSave(
      date,
      parsed,
      note.trim() || null
    );
    setSaving(false);

    if (saveError) {
      setError(saveError.message ?? "Kunde inte spara");
      return;
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
        <Pressable
          style={{ flex: 1 }}
          onPress={handleClose}
        >
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
            maxHeight="85%"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$4"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <AppText variant="h3">
                {isEdit ? "Redigera mätning" : "Lägg till mätning"}
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
                <AppInput
                  label="Datum"
                  placeholder="ÅÅÅÅ-MM-DD"
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                />

                {DEFAULT_MEASUREMENT_KEYS.map((key) => (
                  <AppInput
                    key={key}
                    label={`${getMeasurementLabel(key)} (${getUnit(key)})`}
                    placeholder="0"
                    value={measurements[key] ?? ""}
                    onChangeText={(v) => updateMeasurement(key, v)}
                    keyboardType="decimal-pad"
                  />
                ))}

                <AppInput
                  label="Anteckning (valfritt)"
                  placeholder="T.ex. morgon innan frukost"
                  value={note}
                  onChangeText={setNote}
                  multiline
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
              Spara mätning
            </AppButton>
          </YStack>
            </Pressable>
          </YStack>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
