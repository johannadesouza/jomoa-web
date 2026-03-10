/**
 * PresentationSettingsSection – redigera presentation_profile och presentation_theme.
 * Sparar till clients och anropar refreshClient() så att tema och copy uppdateras.
 */
import React, { useState } from "react";
import { Pressable } from "react-native";
import { YStack, XStack } from "tamagui";
import { AppText, Card, Section } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { updateClient } from "../../lib/repos/userRepo/clients";
import type { PresentationProfile, PresentationTheme } from "../../shared/types/onboarding";

const PROFILES: { value: PresentationProfile; label: string }[] = [
  { value: "female", label: "Kvinna" },
  { value: "male", label: "Man" },
  { value: "neutral", label: "Annat" },
];

const THEMES: { value: PresentationTheme; label: string }[] = [
  { value: "bold", label: "Kraftfull & tydlig" },
  { value: "soft", label: "Ljusare & mjukare" },
  { value: "neutral", label: "Neutral" },
];

export function PresentationSettingsSection() {
  const { client, refreshClient } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  const profile = client?.presentation_profile ?? "neutral";
  const theme = client?.presentation_theme ?? "neutral";

  const handleSelectProfile = async (newProfile: PresentationProfile) => {
    if (!client?.id || newProfile === profile) return;
    setSavingProfile(true);
    const { error } = await updateClient(client.id, { presentation_profile: newProfile });
    if (!error) await refreshClient();
    setSavingProfile(false);
  };

  const handleSelectTheme = async (newTheme: PresentationTheme) => {
    if (!client?.id || newTheme === theme) return;
    setSavingTheme(true);
    const { error } = await updateClient(client.id, { presentation_theme: newTheme });
    if (!error) await refreshClient();
    setSavingTheme(false);
  };

  if (!client) return null;

  return (
    <Section
      title="Profil & stil"
      subtitle="Texter och utseende anpassas utifrån dessa val"
    >
      <Card>
        <Card.Content>
          <YStack gap="$4">
            {/* Hur vi anpassar upplevelsen */}
            <YStack gap="$2">
              <AppText variant="small" fontWeight="600" color="$color">
                Hur vi anpassar upplevelsen
              </AppText>
              <YStack gap="$3">
                {PROFILES.map((p) => {
                  const isActive = profile === p.value;
                  return (
                    <Pressable
                      key={p.value}
                      onPress={() => handleSelectProfile(p.value)}
                      disabled={savingProfile}
                    >
                      <XStack
                        gap="$3"
                        alignItems="center"
                        paddingVertical="$2"
                        opacity={savingProfile ? 0.6 : 1}
                      >
                        <XStack
                          width={22}
                          height={22}
                          borderRadius={11}
                          borderWidth={2}
                          borderColor={isActive ? "$accent" : "$borderSoft"}
                          backgroundColor={isActive ? "$accent" : "transparent"}
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          {isActive && (
                            <XStack
                              width={10}
                              height={10}
                              borderRadius={5}
                              backgroundColor="$background"
                            />
                          )}
                        </XStack>
                        <AppText variant="body" fontWeight={isActive ? "700" : "400"}>
                          {p.label}
                        </AppText>
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>
            </YStack>

            {/* Stil (tema) */}
            <YStack gap="$2">
              <AppText variant="small" fontWeight="600" color="$color">
                Stil
              </AppText>
              <YStack gap="$3">
                {THEMES.map((t) => {
                  const isActive = theme === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => handleSelectTheme(t.value)}
                      disabled={savingTheme}
                    >
                      <XStack
                        gap="$3"
                        alignItems="center"
                        paddingVertical="$2"
                        opacity={savingTheme ? 0.6 : 1}
                      >
                        <XStack
                          width={22}
                          height={22}
                          borderRadius={11}
                          borderWidth={2}
                          borderColor={isActive ? "$accent" : "$borderSoft"}
                          backgroundColor={isActive ? "$accent" : "transparent"}
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          {isActive && (
                            <XStack
                              width={10}
                              height={10}
                              borderRadius={5}
                              backgroundColor="$background"
                            />
                          )}
                        </XStack>
                        <AppText variant="body" fontWeight={isActive ? "700" : "400"}>
                          {t.label}
                        </AppText>
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>
            </YStack>
          </YStack>
        </Card.Content>
      </Card>
    </Section>
  );
}
