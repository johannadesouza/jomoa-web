import React, { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { Screen, Card, AppText, AppButton, AppInput } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext";
import { RootStackParamList } from "../../navigation/RootNavigator";

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text color="$error" fontSize="$sm" textAlign="center">
      {message}
    </Text>
  );
}

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Fyll i e-post och lösenord");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Screen scroll padded centered>
        <YStack flex={1} justifyContent="center" gap="$8" width="100%">
          <YStack alignItems="center" gap="$3">
            <AppText variant="h1">JOMOA</AppText>
            <AppText variant="body" muted>
              Din personliga träningscoach
            </AppText>
          </YStack>

          <Card>
            <Card.Content>
              <YStack gap="$5">
                <AppInput
                  label="E-post"
                  placeholder="din@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <AppInput
                  label="Lösenord"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <ErrorMessage message={error} />

                <AppButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Logga in
                </AppButton>
              </YStack>
            </Card.Content>
          </Card>

          <XStack justifyContent="center" gap="$2">
            <AppText variant="body" muted>
              Har du inget konto?
            </AppText>
            <Text
              color="$accent"
              fontSize="$md"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => navigation.navigate("Register" as never)}
            >
              Registrera dig
            </Text>
          </XStack>
        </YStack>
      </Screen>
    </TouchableWithoutFeedback>
  );
}
