/**
 * Mätningslogg – body_measurements (databas-synk)
 */
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { YStack, XStack } from "tamagui";

import {
  Screen,
  Section,
  Card,
  AppText,
  AppButton,
  LoadingScreen,
  EmptyState,
} from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { useMeasurements } from "../../lib/hooks/useMeasurements";
import { getMeasurementLabel } from "../../lib/services/measurementsService";
import { AddMeasurementModal } from "./AddMeasurementModal";

export function MeasurementsScreen() {
  const { client } = useAuth();
  const { records, isLoading, save, refetch } = useMeasurements(client?.id);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) return <LoadingScreen message="Laddar mätningar..." />;

  return (
    <Screen scroll padded>
      <YStack gap="$6" paddingBottom="$8">
        <Section
          title="Mätningslogg"
          subtitle="Vikt, midja, höfter – fyll i det du vill spåra"
        >
          {records.length === 0 ? (
            <Card>
              <Card.Content>
                <EmptyState
                  icon="📏"
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
                <Card key={r.id}>
                  <Card.Content>
                    <XStack justifyContent="space-between" alignItems="center">
                      <AppText variant="h3">{r.date}</AppText>
                      <AppText variant="caption" muted>
                        {(r.measurements ? Object.keys(r.measurements) : []).length} mätvärden
                      </AppText>
                    </XStack>
                    <YStack gap="$2" marginTop="$2">
                      {Object.entries(r.measurements ?? {}).map(([key, val]) => (
                        <XStack
                          key={key}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <AppText variant="small" muted>
                            {getMeasurementLabel(key)}
                          </AppText>
                          <AppText variant="body" fontWeight="600">
                            {typeof val === "number" ? `${val}` : String(val)}
                            {key === "weight" ? " kg" : " cm"}
                          </AppText>
                        </XStack>
                      ))}
                    </YStack>
                  </Card.Content>
                </Card>
              ))}
            </YStack>
          )}
        </Section>

        <AppButton
          variant="secondary"
          onPress={() => setAddModalVisible(true)}
        >
          Lägg till mätning
        </AppButton>
      </YStack>

      <AddMeasurementModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={save}
      />
    </Screen>
  );
}
