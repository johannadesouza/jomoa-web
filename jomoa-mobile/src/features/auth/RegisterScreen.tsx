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

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Fyll i alla fält");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await signUp(email.trim(), password, fullName.trim());

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <Screen scroll padded centered>
        <SuccessView onNavigateLogin={() => navigation.navigate("Login")} />
      </Screen>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Screen scroll padded>
        <YStack flex={1} justifyContent="center" gap="$8" paddingVertical="$8">
          <YStack alignItems="center" gap="$3">
            <AppText variant="h1">Skapa konto</AppText>
            <AppText variant="body" muted>
              Kom igång med din träning
            </AppText>
          </YStack>

          <Card>
            <Card.Content>
              <YStack gap="$5">
                <AppInput
                  label="Namn"
                  placeholder="Ditt namn"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />

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
                  placeholder="Minst 6 tecken"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <AppInput
                  label="Bekräfta lösenord"
                  placeholder="Upprepa lösenordet"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <ErrorMessage message={error} />

                <AppButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Registrera
                </AppButton>
              </YStack>
            </Card.Content>
          </Card>

          <XStack justifyContent="center" gap="$2">
            <AppText variant="body" muted>
              Har du redan ett konto?
            </AppText>
            <Text
              color="$accent"
              fontSize="$md"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => navigation.navigate("Login")}
            >
              Logga in
            </Text>
          </XStack>
        </YStack>
      </Screen>
    </TouchableWithoutFeedback>
  );
}

function SuccessView({ onNavigateLogin }: { onNavigateLogin: () => void }) {
  return (
    <YStack flex={1} justifyContent="center" gap="$6" alignItems="center">
      <AppText variant="h2">Konto skapat!</AppText>
      <AppText variant="body" muted center>
        Kolla din e-post för att verifiera ditt konto.
      </AppText>
      <AppButton variant="primary" onPress={onNavigateLogin}>
        Tillbaka till inloggning
      </AppButton>
    </YStack>
  );
}
