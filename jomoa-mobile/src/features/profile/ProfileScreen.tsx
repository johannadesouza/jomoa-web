/**
 * ProfileScreen – visa och redigera träningsprofil + mål
 */
import React, { useState, useEffect } from "react";
import { Alert, Image } from "react-native";
import { YStack, XStack } from "tamagui";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppIcon,
} from "../../shared/ui";

import { useAuth } from "../../shared/context/AuthContext";
import { supabase } from "../../config/supabase";
import { getPrimaryGoalLabel, getTrainingDaysLabel } from "../../lib/utils/profileLabels";
import { GoalsSection } from "../insights/GoalsSection";
import { RootStackParamList } from "../../navigation/RootNavigator";
import type { TrainingGoal, DayOfWeek } from "../../shared/types/onboarding";
import { fetchFirstAndLatestPhoto, type ProgressPhoto } from "../../lib/services/progressPhotoService";
import { useMeasurements } from "../../lib/hooks/useMeasurements";
import { getMeasurementLabel } from "../../lib/services/measurementsService";
import { AddMeasurementModal } from "../log/AddMeasurementModal";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GOAL_OPTIONS: { value: TrainingGoal; label: string }[] = [
  { value: "muscle_growth", label: "Bygga muskler" },
  { value: "strength", label: "Bli starkare" },
  { value: "fat_loss", label: "Gå ner i vikt" },
  { value: "performance", label: "Bättre prestation" },
  { value: "maintenance", label: "Hålla formen" },
];

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: "Mån" },
  { value: 2, label: "Tis" },
  { value: 3, label: "Ons" },
  { value: 4, label: "Tor" },
  { value: 5, label: "Fre" },
  { value: 6, label: "Lör" },
  { value: 7, label: "Sön" },
];

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, client, refreshClient } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addMeasurementVisible, setAddMeasurementVisible] = useState(false);

  // Mätningar
  const { records: measurements, save: saveMeasurement, refetch: refetchMeasurements } = useMeasurements(client?.id, 5);
  const latestMeasurement = measurements[0] ?? null;

  useFocusEffect(
    React.useCallback(() => {
      refetchMeasurements();
    }, [refetchMeasurements])
  );

  // Före & efter
  const [firstPhoto, setFirstPhoto] = useState<ProgressPhoto | null>(null);
  const [latestPhoto, setLatestPhoto] = useState<ProgressPhoto | null>(null);

  useEffect(() => {
    if (client?.id) {
      fetchFirstAndLatestPhoto(client.id).then(({ first, latest }) => {
        setFirstPhoto(first);
        setLatestPhoto(latest);
      });
    }
  }, [client?.id]);

  // Editstate – initieras när handleEdit körs (client är alltid laddad då)
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  const handleEdit = () => {
    // Reset to current values when opening editor
    setSelectedGoal((client?.primary_goal as TrainingGoal) ?? null);
    setSelectedFrequency(client?.training_frequency ?? 3);
    setSelectedDays((client?.training_days as DayOfWeek[]) ?? []);
    setEditing(true);
  };

  const handleCancel = () => setEditing(false);

  const handleSave = async () => {
    if (!client?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          primary_goal: selectedGoal,
          training_frequency: selectedFrequency,
          training_days: selectedDays,
        })
        .eq("id", client.id);

      if (error) throw error;
      await refreshClient();
      setEditing(false);
    } catch {
      Alert.alert("Fel", "Kunde inte spara ändringar. Försök igen.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Screen scroll padded>
        <YStack gap="$6" paddingTop="$4" paddingBottom="$8">

          {/* ── Profilkort ── */}
          <Card>
            <Card.Content>
              <YStack alignItems="center" gap="$4" paddingVertical="$4">
                <YStack
                  width={80}
                  height={80}
                  borderRadius="$full"
                  backgroundColor="$surface3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AppIcon name="person-outline" size={40} />
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <AppText variant="h3">
                    {user?.user_metadata?.full_name || "Användare"}
                  </AppText>
                  <AppText variant="small" muted>
                    {user?.email}
                  </AppText>
                </YStack>
              </YStack>
            </Card.Content>
          </Card>

          {/* ── Träningsprofil ── */}
          {client?.onboarding_stage === "completed" && (
            <Section
              title="Min träningsprofil"
              subtitle="Dina mål och träningsinställningar"
            >
              {!editing ? (
                <Card>
                  <Card.Content>
                    <YStack gap="$4" paddingVertical="$2">
                      {/* Mål */}
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack gap="$1" flex={1}>
                          <AppText variant="small" muted>Träningsmål</AppText>
                          <AppText variant="body">
                            {getPrimaryGoalLabel(client.primary_goal as TrainingGoal)}
                          </AppText>
                        </YStack>
                      </XStack>

                      {/* Frekvens */}
                      {client.training_frequency != null && client.training_frequency > 0 && (
                        <XStack justifyContent="space-between" alignItems="center">
                          <YStack gap="$1">
                            <AppText variant="small" muted>Träningsfrekvens</AppText>
                            <AppText variant="body">
                              {client.training_frequency} dagar/vecka
                            </AppText>
                          </YStack>
                        </XStack>
                      )}

                      {/* Dagar */}
                      {client.training_days != null && (client.training_days as DayOfWeek[]).length > 0 && (
                        <YStack gap="$1">
                          <AppText variant="small" muted>Träningsdagar</AppText>
                          <AppText variant="body">
                            {getTrainingDaysLabel(client.training_days as DayOfWeek[])}
                          </AppText>
                        </YStack>
                      )}

                      {/* Cykel */}
                      {client.cycle_length != null && client.cycle_length > 0 && (
                        <YStack gap="$1">
                          <AppText variant="small" muted>Cykel</AppText>
                          <AppText variant="body">Cykelspårning aktiverad</AppText>
                        </YStack>
                      )}

                      <AppButton variant="secondary" size="sm" onPress={handleEdit}>
                        Redigera
                      </AppButton>
                    </YStack>
                  </Card.Content>
                </Card>
              ) : (
                <Card>
                  <Card.Content>
                    <YStack gap="$5" paddingVertical="$2">

                      {/* Mål-val */}
                      <YStack gap="$2">
                        <AppText variant="small" muted>Träningsmål</AppText>
                        <YStack gap="$2">
                          {GOAL_OPTIONS.map((opt) => (
                            <XStack
                              key={opt.value}
                              paddingVertical="$3"
                              paddingHorizontal="$3"
                              borderRadius="$3"
                              borderWidth={1}
                              borderColor={selectedGoal === opt.value ? "$accent" : "$borderSoft"}
                              backgroundColor={selectedGoal === opt.value ? "$accent" : "transparent"}
                              alignItems="center"
                              gap="$3"
                              pressStyle={{ opacity: 0.8 }}
                              onPress={() => setSelectedGoal(opt.value)}
                            >
                              <AppIcon
                                name={selectedGoal === opt.value ? "checkmark-circle" : "ellipse-outline"}
                                size={20}
                                color={selectedGoal === opt.value ? "#FFF" : undefined}
                              />
                              <AppText
                                variant="body"
                                color={selectedGoal === opt.value ? "#FFF" : "$textPrimary"}
                              >
                                {opt.label}
                              </AppText>
                            </XStack>
                          ))}
                        </YStack>
                      </YStack>

                      {/* Frekvens */}
                      <YStack gap="$2">
                        <AppText variant="small" muted>Dagar per vecka</AppText>
                        <XStack gap="$2" flexWrap="wrap">
                          {FREQUENCY_OPTIONS.map((f) => (
                            <XStack
                              key={f}
                              width={44}
                              height={44}
                              borderRadius="$full"
                              borderWidth={1}
                              borderColor={selectedFrequency === f ? "$accent" : "$borderSoft"}
                              backgroundColor={selectedFrequency === f ? "$accent" : "transparent"}
                              alignItems="center"
                              justifyContent="center"
                              pressStyle={{ opacity: 0.8 }}
                              onPress={() => setSelectedFrequency(f)}
                            >
                              <AppText
                                variant="body"
                                fontWeight="600"
                                color={selectedFrequency === f ? "#FFF" : "$textPrimary"}
                              >
                                {f}
                              </AppText>
                            </XStack>
                          ))}
                        </XStack>
                      </YStack>

                      {/* Träningsdagar */}
                      <YStack gap="$2">
                        <AppText variant="small" muted>Träningsdagar</AppText>
                        <XStack gap="$2" flexWrap="wrap">
                          {DAY_OPTIONS.map((d) => {
                            const active = selectedDays.includes(d.value);
                            return (
                              <XStack
                                key={d.value}
                                paddingHorizontal="$3"
                                paddingVertical="$2"
                                borderRadius="$full"
                                borderWidth={1}
                                borderColor={active ? "$accent" : "$borderSoft"}
                                backgroundColor={active ? "$accent" : "transparent"}
                                pressStyle={{ opacity: 0.8 }}
                                onPress={() => toggleDay(d.value)}
                              >
                                <AppText
                                  variant="caption"
                                  fontWeight="600"
                                  color={active ? "#FFF" : "$textPrimary"}
                                >
                                  {d.label}
                                </AppText>
                              </XStack>
                            );
                          })}
                        </XStack>
                      </YStack>

                      {/* Knappar */}
                      <XStack gap="$3">
                        <AppButton
                          variant="primary"
                          flex={1}
                          onPress={handleSave}
                          disabled={saving}
                        >
                          {saving ? "Sparar..." : "Spara"}
                        </AppButton>
                        <AppButton
                          variant="secondary"
                          flex={1}
                          onPress={handleCancel}
                          disabled={saving}
                        >
                          Avbryt
                        </AppButton>
                      </XStack>
                    </YStack>
                  </Card.Content>
                </Card>
              )}
            </Section>
          )}

          {/* ── Före & efter – visas bara om minst ett foto finns ── */}
          {firstPhoto && (
            <Section
              title="Före & efter"
              subtitle="Din utveckling i bilder"
              viewAllLabel="Mätningar"
              onViewAll={() => navigation.navigate("Measurements")}
            >
              <Card>
                <Card.Content>
                  <XStack gap="$4" alignItems="flex-end" justifyContent="center">
                    {/* Första bilden */}
                    <YStack alignItems="center" gap="$2" flex={1}>
                      <Image
                        source={{ uri: firstPhoto.photoUrl }}
                        style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 10, backgroundColor: "#333" }}
                        resizeMode="cover"
                      />
                      <AppText variant="caption" muted>
                        Start · {firstPhoto.measurementDate}
                      </AppText>
                    </YStack>

                    <AppText variant="h2" color="$accent">→</AppText>

                    {/* Senaste bilden */}
                    {latestPhoto ? (
                      <YStack alignItems="center" gap="$2" flex={1}>
                        <Image
                          source={{ uri: latestPhoto.photoUrl }}
                          style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 10, backgroundColor: "#333" }}
                          resizeMode="cover"
                        />
                        <AppText variant="caption" muted>
                          Nu · {latestPhoto.measurementDate}
                        </AppText>
                      </YStack>
                    ) : (
                      <YStack
                        flex={1}
                        aspectRatio={3 / 4}
                        borderRadius={10}
                        borderWidth={1}
                        borderColor="$borderSoft"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppText variant="caption" muted center>
                          Fler foton syns här
                        </AppText>
                      </YStack>
                    )}
                  </XStack>
                </Card.Content>
              </Card>
            </Section>
          )}

          {/* ── Kroppsdata & mätningar ── */}
          <Section
            title="Kroppsdata"
            subtitle="Vikt och kroppsmått"
            viewAllLabel="Se alla"
            onViewAll={() => navigation.navigate("Measurements")}
          >
            {latestMeasurement ? (
              <Card>
                <Card.Content>
                  <YStack gap="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <AppText variant="small" muted>Senast loggat</AppText>
                      <AppText variant="caption" muted>
                        {formatProfileDate(latestMeasurement.date)}
                      </AppText>
                    </XStack>
                    <XStack flexWrap="wrap" gap="$2">
                      {Object.entries(latestMeasurement.measurements ?? {}).slice(0, 4).map(([key, val]) => (
                        <YStack
                          key={key}
                          backgroundColor="$surface3"
                          borderRadius="$2"
                          paddingHorizontal="$3"
                          paddingVertical="$2"
                          alignItems="center"
                          minWidth={80}
                        >
                          <AppText variant="caption" muted>{getMeasurementLabel(key)}</AppText>
                          <AppText variant="body" fontWeight="700">
                            {typeof val === "number" ? val : String(val)}
                            <AppText variant="caption" muted>
                              {key === "weight" ? " kg" : " cm"}
                            </AppText>
                          </AppText>
                        </YStack>
                      ))}
                    </XStack>
                    <XStack gap="$2">
                      <AppButton
                        variant="secondary"
                        size="sm"
                        flex={1}
                        onPress={() => setAddMeasurementVisible(true)}
                      >
                        + Ny mätning
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        size="sm"
                        flex={1}
                        onPress={() => navigation.navigate("Measurements")}
                      >
                        Historik
                      </AppButton>
                    </XStack>
                  </YStack>
                </Card.Content>
              </Card>
            ) : (
              <Card pressable onPress={() => setAddMeasurementVisible(true)}>
                <Card.Content>
                  <YStack alignItems="center" gap="$3" paddingVertical="$4">
                    <AppIcon name="body-outline" size={36} />
                    <YStack alignItems="center" gap="$1">
                      <AppText variant="body" fontWeight="600">Börja spåra din kropp</AppText>
                      <AppText variant="small" muted center>
                        Logga vikt och mått för att se din utveckling
                      </AppText>
                    </YStack>
                    <AppButton variant="primary" size="sm" onPress={() => setAddMeasurementVisible(true)}>
                      Lägg till mätning
                    </AppButton>
                  </YStack>
                </Card.Content>
              </Card>
            )}
          </Section>

          {/* ── Mål ── */}
          <GoalsSection clientId={client?.id} />

        </YStack>

      <AddMeasurementModal
        visible={addMeasurementVisible}
        onClose={() => {
          setAddMeasurementVisible(false);
          refetchMeasurements();
          if (client?.id) {
            fetchFirstAndLatestPhoto(client.id).then(({ first, latest }) => {
              setFirstPhoto(first);
              setLatestPhoto(latest);
            });
          }
        }}
        onSave={saveMeasurement}
      />
    </Screen>
  );
}

function formatProfileDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}
