/**
 * MeasurementsScreen – historik + trendgraf (bar chart) + swipe-to-delete
 */
import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  PanResponder,
  Pressable,
  Image,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  AppIcon,
  LoadingScreen,
  EmptyState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useMeasurements } from "../../lib/hooks/useMeasurements";
import { getMeasurementLabel } from "../../lib/services/measurementsService";
import { AddMeasurementModal } from "./AddMeasurementModal";

// ─── Trendgraf (bar chart utan extern dependency) ─────────────────────────────

interface TrendGraphProps {
  data: { date: string; value: number }[];
  unit: string;
  color?: string;
}

function TrendGraph({ data, unit, color = "#E8A87C" }: TrendGraphProps) {
  if (data.length < 2) return null;

  const BAR_H = 80;
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Visa max 12 punkter
  const visible = data.slice(-12);

  return (
    <View style={{ marginBottom: 4 }}>
      <XStack alignItems="flex-end" gap="$1" height={BAR_H} paddingBottom={0}>
        {visible.map((d, i) => {
          const pct = ((d.value - minVal) / range) * 0.85 + 0.05; // 5–90%
          const isLast = i === visible.length - 1;
          return (
            <YStack key={i} flex={1} alignItems="center" justifyContent="flex-end" height={BAR_H}>
              <View
                style={{
                  width: "70%",
                  height: BAR_H * pct,
                  borderRadius: 4,
                  backgroundColor: isLast ? color : color + "66",
                }}
              />
            </YStack>
          );
        })}
      </XStack>
      {/* X-labels: bara första och sista */}
      <XStack justifyContent="space-between" paddingTop="$1">
        <AppText variant="caption" muted>
          {formatDateShort(visible[0].date)}
        </AppText>
        <AppText variant="caption" muted>
          {unit}
        </AppText>
        <AppText variant="caption" muted>
          {formatDateShort(visible[visible.length - 1].date)}
        </AppText>
      </XStack>
    </View>
  );
}

// ─── Swipeable rad ────────────────────────────────────────────────────────────

interface SwipeableRowProps {
  onDelete: () => void;
  children: React.ReactNode;
}

function SwipeableRow({ onDelete, children }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const DELETE_THRESHOLD = -80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, DELETE_THRESHOLD * 1.2));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < DELETE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: DELETE_THRESHOLD,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ overflow: "hidden", borderRadius: 12 }}>
      {/* Radera-bakgrund */}
      <View
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: "#E53E3E",
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable onPress={onDelete} style={{ padding: 12 }}>
          <AppIcon name="trash-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

// ─── Huvudkomponent ───────────────────────────────────────────────────────────

export function MeasurementsScreen() {
  const { client } = useAuth();
  const { records, isLoading, save, remove, refetch } = useMeasurements(client?.id);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<typeof records[0] | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleDelete = (date: string) => {
    Alert.alert(
      "Ta bort mätning",
      `Vill du ta bort mätningen från ${date}?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ta bort",
          style: "destructive",
          onPress: () => remove(date),
        },
      ]
    );
  };

  // Bygg viktdata för graf (kronologisk ordning)
  const weightData = [...records]
    .filter((r) => r.measurements?.weight != null)
    .reverse()
    .map((r) => ({ date: r.date, value: r.measurements.weight }));

  if (isLoading) return <LoadingScreen message="Laddar mätningar..." />;

  return (
    <Screen scroll padded>
      <YStack gap="$6" paddingBottom="$8">

        {/* ── Trendgraf vikt ── */}
        {weightData.length >= 2 && (
          <Section title="Viktutveckling" subtitle="Dina senaste mätningar">
            <Card>
              <Card.Content>
                <TrendGraph data={weightData} unit="kg" />
                <XStack justifyContent="space-between" paddingTop="$2">
                  <YStack alignItems="center">
                    <AppText variant="caption" muted>Start</AppText>
                    <AppText variant="h3">{weightData[0].value} kg</AppText>
                  </YStack>
                  <YStack alignItems="center">
                    <AppText variant="caption" muted>Nu</AppText>
                    <AppText variant="h3" color="$accent">
                      {weightData[weightData.length - 1].value} kg
                    </AppText>
                  </YStack>
                  <YStack alignItems="center">
                    <AppText variant="caption" muted>Förändring</AppText>
                    <AppText
                      variant="h3"
                      color={
                        weightData[weightData.length - 1].value - weightData[0].value <= 0
                          ? "$success"
                          : "$error"
                      }
                    >
                      {(weightData[weightData.length - 1].value - weightData[0].value > 0 ? "+" : "") +
                        (weightData[weightData.length - 1].value - weightData[0].value).toFixed(1)} kg
                    </AppText>
                  </YStack>
                </XStack>
              </Card.Content>
            </Card>
          </Section>
        )}

        {/* ── Lista ── */}
        <Section
          title="Mätningshistorik"
          subtitle="Svep vänster för att ta bort"
        >
          {records.length === 0 ? (
            <Card>
              <Card.Content>
                <EmptyState
                  iconName="body-outline"
                  title="Inga mätningar ännu"
                  description="Lägg till din första mätning för att börja spåra din utveckling."
                  actionLabel="Lägg till mätning"
                  onAction={() => setAddModalVisible(true)}
                />
              </Card.Content>
            </Card>
          ) : (
            <YStack gap="$3">
              {records.map((r) => (
                <SwipeableRow
                  key={r.id}
                  onDelete={() => handleDelete(r.date)}
                >
                  <Pressable onPress={() => setEditRecord(r)}>
                    <Card>
                      <Card.Content>
                        <XStack gap="$3" alignItems="flex-start">
                          {/* Foto – visas bara om det finns */}
                          {r.photo_url && (
                            <Image
                              source={{ uri: r.photo_url }}
                              style={{
                                width: 56,
                                height: 72,
                                borderRadius: 8,
                                backgroundColor: "#333",
                                flexShrink: 0,
                              }}
                              resizeMode="cover"
                            />
                          )}

                          <YStack flex={1} gap="$2">
                            {/* Datum + antal */}
                            <XStack justifyContent="space-between" alignItems="center">
                              <AppText variant="h3">{formatDate(r.date)}</AppText>
                              <AppText variant="caption" muted>
                                {Object.keys(r.measurements ?? {}).length} värden
                              </AppText>
                            </XStack>

                            {/* Mätvärden */}
                            <XStack flexWrap="wrap" gap="$2">
                              {Object.entries(r.measurements ?? {}).map(([key, val]) => (
                                <YStack
                                  key={key}
                                  backgroundColor="$surface3"
                                  borderRadius="$2"
                                  paddingHorizontal="$2"
                                  paddingVertical="$1"
                                  alignItems="center"
                                >
                                  <AppText variant="caption" muted>
                                    {getMeasurementLabel(key)}
                                  </AppText>
                                  <AppText variant="small" fontWeight="600">
                                    {typeof val === "number" ? val : String(val)}
                                    {key === "weight" ? " kg" : " cm"}
                                  </AppText>
                                </YStack>
                              ))}
                            </XStack>

                            {r.note ? (
                              <AppText variant="caption" muted numberOfLines={1}>
                                {r.note}
                              </AppText>
                            ) : null}
                          </YStack>
                        </XStack>
                      </Card.Content>
                    </Card>
                  </Pressable>
                </SwipeableRow>
              ))}
            </YStack>
          )}
        </Section>

        <AppButton
          variant="primary"
          fullWidth
          onPress={() => {
            setEditRecord(null);
            setAddModalVisible(true);
          }}
        >
          Lägg till mätning
        </AppButton>
      </YStack>

      <AddMeasurementModal
        visible={addModalVisible || editRecord != null}
        onClose={() => {
          setAddModalVisible(false);
          setEditRecord(null);
        }}
        onSave={save}
        initialValues={
          editRecord
            ? {
                date: editRecord.date,
                measurements: editRecord.measurements,
                note: editRecord.note ?? "",
                photoUrl: editRecord.photo_url,
              }
            : null
        }
      />
    </Screen>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "jan", "feb", "mar", "apr", "maj", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function formatDateShort(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}`;
}
