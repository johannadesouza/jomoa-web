/**
 * Modal för att lägga till eller redigera en mätning – med valfritt progress-foto.
 */
import React, { useState, useEffect } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { YStack, XStack } from "tamagui";
import * as ImagePicker from "expo-image-picker";

import { AppText, AppButton, AppInput, AppIcon } from "../../shared/ui";
import { getLocalDateString } from "../../lib/utils/date";
import {
  getMeasurementLabel,
  DEFAULT_MEASUREMENT_KEYS,
  type MeasurementKey,
} from "../../lib/services/measurementsService";
import { uploadProgressPhoto } from "../../lib/services/progressPhotoService";
import { useAuth } from "../../shared/context/AuthContext";

// ─── Hjälpfunktioner för datum ────────────────────────────────────────────────

function dateToDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

// ─── DateStepper ──────────────────────────────────────────────────────────────

interface DateStepperProps {
  value: string;
  onChange: (date: string) => void;
}

function DateStepper({ value, onChange }: DateStepperProps) {
  const today = getLocalDateString();
  return (
    <YStack gap="$1">
      <AppText variant="small" muted>Datum</AppText>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$surface3"
        borderRadius="$3"
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderWidth={1}
        borderColor="$borderSoft"
      >
        <TouchableOpacity onPress={() => onChange(addDays(value, -1))}>
          <AppIcon name="chevron-back-outline" size={22} />
        </TouchableOpacity>

        <YStack alignItems="center" gap="$1">
          <AppText variant="body" fontWeight="600">
            {dateToDisplay(value)}
          </AppText>
          {isToday(value) && (
            <AppText variant="caption" muted>Idag</AppText>
          )}
        </YStack>

        <TouchableOpacity
          onPress={() => onChange(addDays(value, 1))}
          disabled={value >= today}
        >
          <AppIcon
            name="chevron-forward-outline"
            size={22}
            color={value >= today ? "#555" : undefined}
          />
        </TouchableOpacity>
      </XStack>
      {/* Snabbknappar */}
      <XStack gap="$2" paddingTop="$1">
        {[
          { label: "Igår", delta: -1 },
          { label: "Idag", delta: 0 },
        ].map(({ label, delta }) => {
          const target = delta === 0 ? today : addDays(today, delta);
          const active = value === target;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => onChange(target)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                backgroundColor: active ? "#E8A87C" : "transparent",
                borderWidth: 1,
                borderColor: active ? "#E8A87C" : "#444",
              }}
            >
              <AppText variant="caption" color={active ? "#fff" : undefined}>
                {label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </XStack>
    </YStack>
  );
}

export interface MeasurementFormValues {
  date: string;
  measurements: Record<string, number>;
  note: string;
  photoUrl?: string | null;
}

interface AddMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    date: string,
    measurements: Record<string, number>,
    note?: string | null,
    photoUrl?: string | null
  ) => Promise<{ error: Error | null }>;
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
  const { user } = useAuth();
  const isEdit = !!initialValues;

  const [date, setDate] = useState(initialValues?.date ?? getLocalDateString());
  const [showAllFields, setShowAllFields] = useState(false);
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

  // Foto-state
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(
    initialValues?.photoUrl ?? null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
      setLocalPhotoUri(null);
      setExistingPhotoUrl(initialValues?.photoUrl ?? null);
      setError(null);
      setShowAllFields(false);
    }
  }, [visible, initialValues]);

  const updateMeasurement = (key: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Behörighet att komma åt bilder krävs.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUri(result.assets[0].uri);
      setExistingPhotoUrl(null);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Behörighet att använda kameran krävs.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUri(result.assets[0].uri);
      setExistingPhotoUrl(null);
    }
  };

  const handleRemovePhoto = () => {
    setLocalPhotoUri(null);
    setExistingPhotoUrl(null);
  };

  const handleSave = async () => {
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

    let finalPhotoUrl: string | null = existingPhotoUrl ?? null;

    // Ladda upp ny bild om vald
    if (localPhotoUri && user?.id) {
      setUploadingPhoto(true);
      try {
        const result = await uploadProgressPhoto(user.id, date, localPhotoUri);
        if ("error" in result) {
          setError(`Kunde inte ladda upp bild: ${result.error}`);
          setSaving(false);
          return;
        }
        finalPhotoUrl = result.signedUrl;
      } finally {
        setUploadingPhoto(false);
      }
    }

    const { error: saveError } = await onSave(
      date,
      parsed,
      note.trim() || null,
      finalPhotoUrl
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

  const previewUri = localPhotoUri ?? existingPhotoUrl;

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
                maxWidth={380}
                maxHeight="90%"
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
                  style={{ maxHeight: 480 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <YStack gap="$4">
                    <AppText variant="caption" muted>
                      Fyll i de mätningar du vill logga – minst ett krävs
                    </AppText>

                    {/* Datumväljare */}
                    <DateStepper value={date} onChange={setDate} />

                    {/* Vikt alltid synlig */}
                    <AppInput
                      label="Vikt (kg)"
                      placeholder="0"
                      value={measurements["weight"] ?? ""}
                      onChangeText={(v) => updateMeasurement("weight", v)}
                      keyboardType="decimal-pad"
                    />

                    {/* Övriga mått – toggle */}
                    {showAllFields ? (
                      DEFAULT_MEASUREMENT_KEYS.filter((k) => k !== "weight").map((key) => (
                        <AppInput
                          key={key}
                          label={`${getMeasurementLabel(key)} (cm)`}
                          placeholder="0"
                          value={measurements[key] ?? ""}
                          onChangeText={(v) => updateMeasurement(key, v)}
                          keyboardType="decimal-pad"
                        />
                      ))
                    ) : (
                      <TouchableOpacity onPress={() => setShowAllFields(true)}>
                        <XStack alignItems="center" gap="$2" paddingVertical="$1">
                          <AppIcon name="add-circle-outline" size={18} />
                          <AppText variant="small" muted>Lägg till kroppsmått (midja, höft...)</AppText>
                        </XStack>
                      </TouchableOpacity>
                    )}

                    <AppInput
                      label="Anteckning (valfritt)"
                      placeholder="T.ex. morgon innan frukost"
                      value={note}
                      onChangeText={setNote}
                      multiline
                    />

                    {/* ── Foto-sektion ── */}
                    <YStack gap="$2">
                      <AppText variant="small" muted>
                        Progress-foto (valfritt)
                      </AppText>

                      {previewUri ? (
                        <YStack gap="$2">
                          <Image
                            source={{ uri: previewUri }}
                            style={{
                              width: "100%",
                              height: 200,
                              borderRadius: 10,
                              backgroundColor: "#333",
                            }}
                            resizeMode="cover"
                          />
                          <TouchableOpacity onPress={handleRemovePhoto}>
                            <XStack alignItems="center" gap="$2" justifyContent="center" paddingVertical="$1">
                              <AppIcon name="trash-outline" size={16} />
                              <AppText variant="caption" color="$error">
                                Ta bort foto
                              </AppText>
                            </XStack>
                          </TouchableOpacity>
                        </YStack>
                      ) : (
                        <XStack gap="$3">
                          <TouchableOpacity
                            onPress={handleTakePhoto}
                            style={{ flex: 1 }}
                          >
                            <YStack
                              flex={1}
                              height={80}
                              borderRadius={10}
                              borderWidth={1}
                              borderColor="$borderSoft"
                              alignItems="center"
                              justifyContent="center"
                              gap="$1"
                            >
                              <AppIcon name="camera-outline" size={24} />
                              <AppText variant="caption" muted>
                                Ta foto
                              </AppText>
                            </YStack>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handlePickPhoto}
                            style={{ flex: 1 }}
                          >
                            <YStack
                              flex={1}
                              height={80}
                              borderRadius={10}
                              borderWidth={1}
                              borderColor="$borderSoft"
                              alignItems="center"
                              justifyContent="center"
                              gap="$1"
                            >
                              <AppIcon name="image-outline" size={24} />
                              <AppText variant="caption" muted>
                                Välj bild
                              </AppText>
                            </YStack>
                          </TouchableOpacity>
                        </XStack>
                      )}
                    </YStack>

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
                  loading={saving || uploadingPhoto}
                  disabled={saving || uploadingPhoto}
                >
                  {uploadingPhoto ? "Laddar upp bild..." : "Spara mätning"}
                </AppButton>
              </YStack>
            </Pressable>
          </YStack>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
