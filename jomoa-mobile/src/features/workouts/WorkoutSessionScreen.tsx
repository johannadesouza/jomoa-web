import React, { useState, useEffect, useRef } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import { Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Screen,
  AppText,
  AppButton,
  Card,
  AppInput,
  LoadingScreen,
} from "../../shared/ui";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAuth } from "../../shared/context/AuthContext";
import { useWorkoutSession, isTimeBasedExercise } from "../../lib/hooks/useWorkoutSession";
import type { ExerciseChallengeLevel } from "../../lib/domain/workout";
import { useTrainingAdaptation } from "../../lib/hooks/useTrainingAdaptation";
import { useTheme } from "../../shared/context/ThemeContext";
import { getThemeColors } from "../../shared/theme/colors";
import type { SetLogEntry } from "../../lib/domain/workout";

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutSession">;

function getLogForSet(
  logs: SetLogEntry[],
  exerciseId: string,
  setNumber: number
): SetLogEntry | undefined {
  return logs.find(
    (l) => l.exerciseId === exerciseId && l.setNumber === setNumber
  );
}

interface SetInputRowProps {
  setNumber: number;
  repsPlanned: number | string;
  log: SetLogEntry | undefined;
  onUpdate: (reps: number | null, weight: number | null) => void;
}

function SetInputRow({ setNumber, repsPlanned, log, onUpdate }: SetInputRowProps) {
  const [reps, setReps] = useState(() => String(log?.reps ?? ""));
  const [weight, setWeight] = useState(() => String(log?.weight ?? ""));

  React.useEffect(() => {
    setReps(String(log?.reps ?? ""));
    setWeight(String(log?.weight ?? ""));
  }, [log?.reps, log?.weight]);

  const handleBlur = () => {
    const r = reps.trim() ? parseInt(reps, 10) : null;
    const w = weight.trim() ? parseFloat(weight) : null;
    if (!isNaN(r as number) || !isNaN(w as number)) {
      onUpdate(
        r != null && !isNaN(r) ? r : null,
        w != null && !isNaN(w) ? w : null
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
    </XStack>
  );
}

interface RestTimerProps {
  secondsRemaining: number;
  isRunning: boolean;
  defaultSeconds: number;
  onStart: (seconds: number) => void;
  onPause: () => void;
  onSkipRest: () => void;
}

const CHALLENGE_LABELS: Record<ExerciseChallengeLevel, string> = {
  easy: "Lätt",
  ok: "Lagom",
  hard: "Hårt",
};

function ChallengeChips({
  selected,
  onSelect,
}: {
  selected: ExerciseChallengeLevel | null;
  onSelect: (level: ExerciseChallengeLevel | null) => void;
}) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <YStack gap="$2">
      <AppText variant="caption" muted>
        Hur utmanande var övningen?
      </AppText>
      <XStack gap="$2" flexWrap="wrap">
        {(["easy", "ok", "hard"] as const).map((level) => {
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              onPress={() => onSelect(selected === level ? null : level)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected ? colors.accent : colors.surface3,
                borderWidth: 1,
                borderColor: isSelected ? colors.accent : "transparent",
              }}
            >
              <AppText
                variant="small"
                fontWeight="500"
                style={{ color: isSelected ? "#fff" : colors.textPrimary }}
              >
                {CHALLENGE_LABELS[level]}
              </AppText>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}

function RestTimer({
  secondsRemaining,
  isRunning,
  defaultSeconds,
  onStart,
  onPause,
  onSkipRest,
}: RestTimerProps) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card backgroundColor="$surface3">
      <Card.Content padding="$6">
        <YStack gap="$4">
          <AppText variant="h3">Vila</AppText>
          <AppText variant="h1" color="$accent">
            {display}
          </AppText>
          <XStack gap="$3" flexWrap="wrap">
            {!isRunning ? (
              <AppButton
                variant="primary"
                size="md"
                onPress={() => onStart(defaultSeconds)}
              >
                Starta vila
              </AppButton>
            ) : (
              <AppButton variant="ghost" size="md" onPress={onPause}>
                Pausa
              </AppButton>
            )}
            <AppButton variant="secondary" size="md" onPress={onSkipRest}>
              Hoppa över
            </AppButton>
          </XStack>
        </YStack>
      </Card.Content>
    </Card>
  );
}

export function WorkoutSessionScreen({ navigation, route }: Props) {
  const sessionId = route.params?.sessionId;
  const isStandalone = route.params?.isStandalone;
  const applyAdjustment = route.params?.applyAdjustment;

  if (!sessionId) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted center>
          Passet kunde inte laddas. Gå tillbaka och försök igen.
        </AppText>
        <AppButton variant="secondary" onPress={() => navigation.goBack()}>
          Tillbaka
        </AppButton>
      </Screen>
    );
  }

  const { client } = useAuth();
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const adaptation = useTrainingAdaptation(client?.id);
  const {
    session,
    logs,
    isLoading,
    isSaving,
    persistError,
    addSetLog,
    updateSetLog,
    completeWorkout,
    abortWorkout,
    finishLastExerciseAndComplete,
    restTimer,
    sortedExercises,
    currentExerciseIndex,
    phase,
    currentExercise,
    nextExercise,
    isLastExercise,
    goToNextExercise,
    goToPrevExercise,
    skipRest,
  handleRestComplete,
  exerciseTimer,
  } = useWorkoutSession(sessionId, client?.id, isStandalone);

  const [selectedChallenge, setSelectedChallenge] = useState<ExerciseChallengeLevel | null>(null);

  useEffect(() => {
    setSelectedChallenge(null);
  }, [currentExerciseIndex]);

  const restSeconds = currentExercise?.rest_seconds ?? 90;
  const useAdaptation = applyAdjustment !== false;
  const effectiveVolumeModifier = useAdaptation ? adaptation.volumeModifier : 1;
  const getEffectiveSetsPlanned = (n: number) =>
    Math.max(1, Math.round((n ?? 0) * effectiveVolumeModifier));

  useEffect(() => {
    if (phase === "rest" && !restTimer.isRunning && restTimer.secondsRemaining === 0) {
      restTimer.start(restSeconds, false, handleRestComplete);
    }
  }, [phase]);

  const doCompleteAndNavigate = useRef(false);

  useEffect(() => {
    const shouldComplete =
      (phase === "finishing" || currentExerciseIndex >= sortedExercises.length) &&
      sortedExercises.length > 0 &&
      session;
    if (!shouldComplete || doCompleteAndNavigate.current) return;
    doCompleteAndNavigate.current = true;
    (async () => {
      const { error } = await completeWorkout();
      if (error) {
        doCompleteAndNavigate.current = false;
        Alert.alert("Fel", error.message);
      } else {
        const totalVolume = logs.reduce(
          (sum, l) => sum + (l.reps ?? 0) * (l.weight ?? 0),
          0
        );
        navigation.replace("WorkoutSummary", {
          sessionName: session.name ?? "Pass",
          totalSets: logs.length,
          totalVolume: Math.round(totalVolume),
          adaptationApplied: applyAdjustment === true,
        });
      }
    })();
  }, [phase, currentExerciseIndex, sortedExercises.length, session, completeWorkout, logs, navigation, applyAdjustment]);

  const handleAbort = () => {
    Alert.alert(
      "Avbryt pass",
      "Det du loggat sparas inte. Vill du lämna passet?",
      [
        { text: "Nej, fortsätt", style: "cancel" },
        {
          text: "Ja, avbryt",
          style: "destructive",
          onPress: async () => {
            await abortWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

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
              Alert.alert("Fel", error.message);
            } else {
              const totalVolume = logs.reduce(
                (sum, l) => sum + (l.reps ?? 0) * (l.weight ?? 0),
                0
              );
              navigation.replace("WorkoutSummary", {
                sessionName: session?.name ?? "Pass",
                totalSets: logs.length,
                totalVolume: Math.round(totalVolume),
                adaptationApplied: applyAdjustment === true,
              });
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <LoadingScreen message="Laddar pass..." />;

  if (phase === "finishing") {
    return <LoadingScreen message="Sparar pass..." />;
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

  if (currentExerciseIndex >= sortedExercises.length && sortedExercises.length > 0) {
    return <LoadingScreen message="Sparar pass..." />;
  }

  if (phase === "rest") {
    return (
      <Screen padded>
        <YStack gap="$6" flex={1}>
          {persistError && (
            <Card backgroundColor="$error" padding="$3">
              <AppText variant="small" style={{ color: "#FFF" }}>
                {persistError}
              </AppText>
            </Card>
          )}
          <XStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={handleAbort} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={24} color={colors.accent} />
            </Pressable>
            <AppButton variant="ghost" size="sm" disabled={isSaving} onPress={handleFinishWorkout}>
              Avsluta och spara
            </AppButton>
          </XStack>
          <YStack flex={1} justifyContent="center">
            <RestTimer
              secondsRemaining={restTimer.secondsRemaining}
              isRunning={restTimer.isRunning}
              defaultSeconds={restSeconds}
              onStart={(sec) => restTimer.start(sec, false, handleRestComplete)}
              onPause={restTimer.pause}
              onSkipRest={skipRest}
            />
          </YStack>
          {nextExercise && (
            <Card backgroundColor="$surface3">
              <Card.Content padding="$4">
                <AppText variant="caption" muted>
                  UP NEXT
                </AppText>
                <AppText variant="h3" color="$accent">
                  {nextExercise.exercise?.name ?? "Nästa övning"}
                </AppText>
              </Card.Content>
            </Card>
          )}
        </YStack>
      </Screen>
    );
  }

  const ex = currentExercise;
  if (!ex) {
    return (
      <Screen padded centered>
        <AppText variant="body" muted>
          Inga övningar
        </AppText>
        <AppButton variant="secondary" onPress={() => navigation.goBack()}>
          Tillbaka
        </AppButton>
      </Screen>
    );
  }

  const isTimeBased = isTimeBasedExercise(ex);
  const durationSec = ex.duration_seconds ?? 60;
  const effectiveSets = getEffectiveSetsPlanned(ex.sets_planned ?? 0);

  return (
    <Screen scroll padded>
      <YStack gap="$6">
        {persistError && (
          <Card backgroundColor="$error" padding="$3">
            <AppText variant="small" style={{ color: "#FFF" }}>
              {persistError}
            </AppText>
          </Card>
        )}

        <XStack justifyContent="space-between" alignItems="center">
          <Pressable onPress={handleAbort} style={{ padding: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.accent} />
          </Pressable>
          {isTimeBased ? (
            <XStack
              backgroundColor="$accent"
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius="$4"
              gap="$2"
              alignItems="center"
            >
              <Pressable
                onPress={() => {
                  if (exerciseTimer.isRunning) {
                    exerciseTimer.pause();
                  } else {
                    const secs =
                      exerciseTimer.secondsRemaining > 0
                        ? exerciseTimer.secondsRemaining
                        : durationSec;
                    exerciseTimer.start(secs, isLastExercise);
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name={exerciseTimer.isRunning ? "pause" : "play"}
                  size={20}
                  color="#fff"
                />
                <AppText variant="body" fontWeight="600" style={{ color: "#fff" }}>
                  {Math.floor(
                    (exerciseTimer.secondsRemaining > 0
                      ? exerciseTimer.secondsRemaining
                      : durationSec) / 60
                  )}
                  :
                  {(
                    (exerciseTimer.secondsRemaining > 0
                      ? exerciseTimer.secondsRemaining
                      : durationSec) % 60
                  )
                    .toString()
                    .padStart(2, "0")}
                </AppText>
              </Pressable>
            </XStack>
          ) : null}
          <AppButton variant="ghost" size="sm" disabled={isSaving} onPress={handleFinishWorkout}>
            Avsluta och spara
          </AppButton>
        </XStack>

        <XStack
          alignSelf="flex-start"
          backgroundColor="$surface3"
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$accent"
        >
          <AppText variant="caption" color="$accent" fontWeight="600">
            Övning {currentExerciseIndex + 1} av {sortedExercises.length}
          </AppText>
        </XStack>

        <Card backgroundColor="$surface3" minHeight={200}>
          <Card.Content padding="$6" flex={1} justifyContent="center" alignItems="center">
            <Ionicons name="body-outline" size={64} color={colors.textSecondary} />
            <AppText variant="caption" muted marginTop="$2">
              {ex.exercise?.default_video_url
                ? "Video kommer här"
                : "Övning: " + (ex.exercise?.name ?? "")}
            </AppText>
          </Card.Content>
        </Card>

        <YStack gap="$1">
          <AppText variant="h2" color="$accent">
            {(ex.exercise?.name ?? "Okänd övning").toUpperCase()}
          </AppText>
          <AppText variant="body" muted>
            {isTimeBased
              ? `${durationSec} sekunder`
              : `${effectiveSets} set × ${ex.reps_planned ?? "–"} reps`}
          </AppText>
        </YStack>

        {isTimeBased && (
          <YStack gap="$4">
            {!exerciseTimer.isRunning &&
              (exerciseTimer.secondsRemaining === 0 || exerciseTimer.secondsRemaining === durationSec) && (
              <AppButton
                variant="primary"
                size="lg"
                onPress={() => exerciseTimer.start(durationSec)}
              >
                Starta övning
              </AppButton>
            )}
            {(exerciseTimer.isRunning || exerciseTimer.secondsRemaining < durationSec) && (
              <>
                <XStack gap="$3" justifyContent="center">
                  <AppButton
                    variant="secondary"
                    size="md"
                    onPress={() => {
                      exerciseTimer.reset(durationSec);
                      exerciseTimer.start(durationSec, isLastExercise);
                    }}
                  >
                    Omstart
                  </AppButton>
                  <AppButton
                    variant="primary"
                    size="md"
                    onPress={() =>
                      isLastExercise
                        ? finishLastExerciseAndComplete(selectedChallenge ?? undefined)
                        : goToNextExercise(selectedChallenge ?? undefined)
                    }
                    disabled={exerciseTimer.isRunning}
                  >
                    {isLastExercise ? "Avsluta övning" : "Nästa övning"}
                  </AppButton>
                </XStack>
                <ChallengeChips selected={selectedChallenge} onSelect={setSelectedChallenge} />
              </>
            )}
          </YStack>
        )}

        {!isTimeBased && (
          <YStack gap="$4">
            <YStack gap="$2">
              {Array.from({ length: effectiveSets }, (_, i) => i + 1).map((setNum) => (
                <SetInputRow
                key={setNum}
                setNumber={setNum}
                repsPlanned={ex.reps_planned ?? 0}
                log={getLogForSet(logs, ex.exercise_id, setNum)}
                onUpdate={(reps, weight) => {
                  const existing = getLogForSet(logs, ex.exercise_id, setNum);
                  if (existing) {
                    updateSetLog(ex.exercise_id, setNum, { reps, weight });
                  } else {
                    addSetLog({
                      exerciseId: ex.exercise_id,
                      setNumber: setNum,
                      reps,
                      weight,
                    });
                  }
                }}
              />
              ))}
            </YStack>
            <ChallengeChips selected={selectedChallenge} onSelect={setSelectedChallenge} />
            <AppButton
              variant="primary"
              size="lg"
              onPress={() =>
                isLastExercise
                  ? finishLastExerciseAndComplete(selectedChallenge ?? undefined)
                  : goToNextExercise(selectedChallenge ?? undefined)
              }
            >
              {isLastExercise ? "Sista – avsluta övning" : "Nästa övning"}
            </AppButton>
          </YStack>
        )}

        <Card backgroundColor="$surface3">
          <Card.Content padding="$4">
            <XStack justifyContent="space-between" alignItems="center" gap="$4">
              <Pressable
                onPress={goToPrevExercise}
                disabled={currentExerciseIndex === 0}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentExerciseIndex === 0 ? 0.4 : 1,
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </Pressable>
              <YStack flex={1} alignItems="center">
                <AppText variant="caption" muted>
                  UP NEXT
                </AppText>
                <AppText variant="h3" color="$accent" numberOfLines={1}>
                  {nextExercise?.exercise?.name ?? "–"}
                </AppText>
              </YStack>
              <Pressable
                onPress={() => {
                  if (isLastExercise) {
                    finishLastExerciseAndComplete(selectedChallenge ?? undefined);
                  } else {
                    goToNextExercise(selectedChallenge ?? undefined);
                  }
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={isLastExercise ? "checkmark" : "chevron-forward"}
                  size={24}
                  color="#fff"
                />
              </Pressable>
            </XStack>
          </Card.Content>
        </Card>
      </YStack>
    </Screen>
  );
}
