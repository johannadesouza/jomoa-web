import React, { useState } from "react";
import { YStack, XStack } from "tamagui";
import { Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  Section,
  AppInput,
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { useWorkoutSession } from "../../lib/hooks/useWorkoutSession";
import { useTrainingAdaptation } from "../../lib/hooks/useTrainingAdaptation";
import type { SessionExercise } from "../../lib/services/workoutService";
import type { SetLogEntry } from "../../lib/domain/workout";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutSession">;

function getLogForSet(
  setLogs: SetLogEntry[],
  exerciseId: string,
  setNumber: number
): SetLogEntry | undefined {
  return setLogs.find(
    (l) => l.exerciseId === exerciseId && l.setNumber === setNumber
  );
}

interface SetInputRowProps {
  setNumber: number;
  repsPlanned: number | string;
  log: SetLogEntry | undefined;
  onUpdate: (reps: number | null, weight: number | null, rpe: number | null) => void;
}

function SetInputRow({ setNumber, repsPlanned, log, onUpdate }: SetInputRowProps) {
  const [reps, setReps] = useState(() => String(log?.reps ?? ""));
  const [weight, setWeight] = useState(() => String(log?.weight ?? ""));
  const [rpe, setRpe] = useState(() => String(log?.rpe ?? ""));

  React.useEffect(() => {
    setReps(String(log?.reps ?? ""));
    setWeight(String(log?.weight ?? ""));
    setRpe(String(log?.rpe ?? ""));
  }, [log?.reps, log?.weight, log?.rpe]);

  const handleBlur = () => {
    const r = reps.trim() ? parseInt(reps, 10) : null;
    const w = weight.trim() ? parseFloat(weight) : null;
    const rp = rpe.trim() ? parseFloat(rpe) : null;
    if (!isNaN(r as number) || !isNaN(w as number) || !isNaN(rp as number)) {
      onUpdate(
        r != null && !isNaN(r) ? r : null,
        w != null && !isNaN(w) ? w : null,
        rp != null && !isNaN(rp) ? rp : null
      );
    }
  };

  return (
    <XStack gap="$2" alignItems="center" paddingVertical="$2">
      <AppText variant="caption" width={24}>
        {setNumber}
      </AppText>
      <AppInput
        size="sm"
        placeholder="Reps"
        keyboardType="number-pad"
        value={reps}
        onChangeText={setReps}
        onBlur={handleBlur}
      />
      <AppInput
        size="sm"
        placeholder="kg"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
        onBlur={handleBlur}
      />
      <AppInput
        size="sm"
        placeholder="RPE"
        keyboardType="decimal-pad"
        value={rpe}
        onChangeText={setRpe}
        onBlur={handleBlur}
      />
    </XStack>
  );
}

interface RestTimerProps {
  secondsRemaining: number;
  isRunning: boolean;
  defaultSeconds: number;
  onStart: (seconds: number) => void;
  onPause: () => void;
}

function RestTimer({
  secondsRemaining,
  isRunning,
  defaultSeconds,
  onStart,
  onPause,
}: RestTimerProps) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card backgroundColor="$surface3">
      <Card.Content>
        <XStack alignItems="center" justifyContent="space-between" gap="$4">
          <YStack>
            <AppText variant="caption" muted>
              Vila
            </AppText>
            <AppText variant="h2">{display}</AppText>
          </YStack>
          <XStack gap="$2">
            {!isRunning ? (
              <AppButton
                variant="secondary"
                size="sm"
                onPress={() => onStart(defaultSeconds)}
              >
                Starta
              </AppButton>
            ) : (
              <AppButton variant="ghost" size="sm" onPress={onPause}>
                Pausa
              </AppButton>
            )}
          </XStack>
        </XStack>
      </Card.Content>
    </Card>
  );
}

export function WorkoutSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const { client } = useAuth();
  const adaptation = useTrainingAdaptation(client?.id);
  const {
    session,
    setLogs,
    isLoading,
    isSaving,
    addSetLog,
    updateSetLog,
    completeWorkout,
    restTimer,
  } = useWorkoutSession(sessionId, client?.id);

  const handleFinishWorkout = () => {
    Alert.alert(
      "Avsluta pass",
      "Vill du spara och avsluta passet?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Avsluta",
          onPress: async () => {
            const { error } = await completeWorkout();
            if (error) {
              Alert.alert("Fel", "Kunde inte spara passet. Försök igen.");
            } else {
              const totalVolume = setLogs.reduce(
                (sum, l) => sum + (l.reps ?? 0) * (l.weight ?? 0),
                0
              );
              navigation.replace("WorkoutSummary", {
                sessionName: session?.name ?? "Pass",
                totalSets: setLogs.length,
                totalVolume: Math.round(totalVolume),
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Laddar pass...
        </AppText>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Kunde inte hitta passet
        </AppText>
        <AppButton variant="secondary" onPress={() => navigation.goBack()}>
          Gå tillbaka
        </AppButton>
      </Screen>
    );
  }

  const exercises = (session.session_exercises ?? []) as (SessionExercise & {
    rest_seconds?: number;
    exercise?: { default_video_url?: string };
  })[];
  const sortedExercises = [...exercises].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const totalSets = sortedExercises.reduce(
    (sum, e) => sum + (e.sets_planned ?? 0),
    0
  );
  const completedTotal = setLogs.length;
  const progress = totalSets > 0 ? (completedTotal / totalSets) * 100 : 0;

  const defaultRestSeconds = exercises[0]?.rest_seconds ?? 90;

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <AppText variant="h1">{session.name}</AppText>
            <AppButton
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onPress={handleFinishWorkout}
            >
              Avsluta
            </AppButton>
          </XStack>
          {session.focus && (
            <AppText variant="small" muted>
              Fokus: {session.focus}
            </AppText>
          )}
          {adaptation.reason && (
            <AppText variant="small" muted>
              Idag: {adaptation.reason}
              {adaptation.suggestRecovery && " Överväg ett lättare pass."}
            </AppText>
          )}
        </YStack>

        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <AppText variant="small" muted>
              Progress
            </AppText>
            <AppText variant="small" muted>
              {completedTotal} / {totalSets} set
            </AppText>
          </XStack>
          <XStack
            height={8}
            backgroundColor="$backgroundStrong"
            borderRadius="$full"
            overflow="hidden"
          >
            <XStack
              width={`${progress}%`}
              height="100%"
              backgroundColor="$accent"
              borderRadius="$full"
            />
          </XStack>
        </YStack>

        <RestTimer
          secondsRemaining={restTimer.secondsRemaining}
          isRunning={restTimer.isRunning}
          defaultSeconds={defaultRestSeconds}
          onStart={restTimer.start}
          onPause={restTimer.pause}
        />

        <Section title="Övningar">
          <YStack gap="$4">
            {sortedExercises.map((exercise) => {
              const setsPlanned = exercise.sets_planned ?? 0;
              const exerciseLogs = setLogs.filter(
                (l) => l.exerciseId === exercise.exercise_id
              );
              const loggedCount = exerciseLogs.length;

              return (
                <Card key={exercise.id}>
                  <Card.Content>
                    <YStack gap="$3">
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack flex={1}>
                          <AppText variant="h3">
                            {exercise.exercise?.name ?? "Okänd övning"}
                          </AppText>
                          <AppText variant="small" muted>
                            {setsPlanned} set × {exercise.reps_planned ?? "–"} reps
                          </AppText>
                        </YStack>
                        <XStack
                          backgroundColor={
                            loggedCount >= setsPlanned
                              ? "$success"
                              : "$backgroundStrong"
                          }
                          paddingHorizontal="$3"
                          paddingVertical="$1"
                          borderRadius="$full"
                        >
                          <AppText
                            variant="caption"
                            color={
                              loggedCount >= setsPlanned ? "$background" : "$color"
                            }
                          >
                            {loggedCount}/{setsPlanned}
                          </AppText>
                        </XStack>
                      </XStack>

                      {Array.from({ length: setsPlanned }, (_, i) => i + 1).map(
                        (setNum) => (
                          <SetInputRow
                            key={setNum}
                            setNumber={setNum}
                            repsPlanned={exercise.reps_planned ?? 0}
                            log={getLogForSet(
                              setLogs,
                              exercise.exercise_id,
                              setNum
                            )}
                            onUpdate={(reps, weight, rpe) => {
                              const existing = getLogForSet(
                                setLogs,
                                exercise.exercise_id,
                                setNum
                              );
                              if (existing) {
                                updateSetLog(
                                  exercise.exercise_id,
                                  setNum,
                                  { reps, weight, rpe }
                                );
                              } else {
                                addSetLog({
                                  exerciseId: exercise.exercise_id,
                                  setNumber: setNum,
                                  reps,
                                  weight,
                                  rpe,
                                });
                              }
                            }}
                          />
                        )
                      )}
                    </YStack>
                  </Card.Content>
                </Card>
              );
            })}
          </YStack>
        </Section>

        <YStack paddingVertical="$8">
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            loading={isSaving}
            onPress={handleFinishWorkout}
          >
            Avsluta pass
          </AppButton>
        </YStack>
      </YStack>
    </Screen>
  );
}
