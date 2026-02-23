import React, { useEffect, useRef, useState } from "react";
import { NativeSyntheticEvent, NativeScrollEvent, ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";

import { PhaseCard, PhaseCardPhase } from "./PhaseCard";
import { getVisibleIndexFromScrollOffset } from "./carouselUtils";

const CARD_WIDTH = 160;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;
const PADDING_H = 16;

interface PhaseCardCarouselProps {
  activePhase: PhaseCardPhase | null;
  cycleDay?: number;
  onPhasePress?: (phase: PhaseCardPhase) => void;
}

const PHASES: PhaseCardPhase[] = ["menstruation", "follicular", "ovulation", "luteal"];

export function PhaseCardCarousel({
  activePhase,
  cycleDay,
  onPhasePress,
}: PhaseCardCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [visibleIndex, setVisibleIndex] = useState(() =>
    activePhase ? PHASES.indexOf(activePhase) : 0
  );

  useEffect(() => {
    if (activePhase && scrollRef.current) {
      const index = PHASES.indexOf(activePhase);
      const offset = PADDING_H + index * SNAP_INTERVAL;
      setVisibleIndex(index);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: offset, animated: true });
      }, 100);
    }
  }, [activePhase]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    setVisibleIndex(getVisibleIndexFromScrollOffset(offset));
  };

  return (
    <YStack gap="$3">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: PADDING_H,
          paddingVertical: 8,
        }}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
      >
        {PHASES.map((phase) => (
          <PhaseCard
            key={phase}
            phase={phase}
            cycleDay={activePhase === phase ? cycleDay : undefined}
            isActive={activePhase === phase}
            onPress={() => onPhasePress?.(phase)}
            width={CARD_WIDTH}
          />
        ))}
      </ScrollView>
      <XStack justifyContent="center" gap="$2">
        {PHASES.map((_, idx) => (
          <YStack
            key={idx}
            width={visibleIndex === idx ? 12 : 6}
            height={6}
            borderRadius="$full"
            backgroundColor={visibleIndex === idx ? "$accent" : "$surface3"}
          />
        ))}
      </XStack>
    </YStack>
  );
}
