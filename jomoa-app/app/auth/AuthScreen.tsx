import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabaseClient";

type Mode = "login" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [role, setRole] = useState<"coach" | "client">("coach");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Fel", "Fyll i e-post och lösenord");
      return;
    }

    if (mode === "signup" && (!first_name.trim() || !last_name.trim())) {
      Alert.alert("Fel", "Fyll i ditt förnamn och efternamn");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        console.log("[AuthScreen] Starting signup process...");
        console.log("[AuthScreen] Email:", email.trim().toLowerCase());
        console.log("[AuthScreen] Role:", role);
        console.log("[AuthScreen] First name:", first_name.trim());
        console.log("[AuthScreen] Last name:", last_name.trim());

        // Step 1: Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (authError) {
          console.error("[AuthScreen] Auth signup error:", {
            message: authError.message,
            status: authError.status,
            code: authError.code,
          });
          throw authError;
        }

        if (!authData.user) {
          console.error("[AuthScreen] No user data returned from sign up");
          throw new Error("No user data returned from sign up");
        }

        console.log("[AuthScreen] User created successfully, ID:", authData.user.id);

        // Step 2: Create profile in profiles table
        // Note: profiles table has: id, role, first_name, last_name, avatar_url, created_at, updated_at
        // No 'status' column exists in profiles table
        const profileData = {
          id: authData.user.id, // profiles.id = auth.users.id (FK)
          role: role,
          first_name: first_name.trim() || null,
          last_name: last_name.trim() || null,
        };

        console.log("[AuthScreen] Creating profile with data:", profileData);

        const { data: profileInsertData, error: profileError } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error("[AuthScreen] Profile creation error:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
            fullError: JSON.stringify(profileError, null, 2),
          });

          // If profile already exists (e.g., created by trigger), that's okay
          if (profileError.code === "23505") {
            console.log("[AuthScreen] Profile already exists (likely created by trigger), fetching existing profile...");
            
            // Try to fetch the existing profile to verify it was created
            const { data: existingProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authData.user.id)
              .single();

            if (fetchError) {
              console.error("[AuthScreen] Error fetching existing profile:", {
                message: fetchError.message,
                code: fetchError.code,
                details: fetchError.details,
                hint: fetchError.hint,
              });
              throw new Error("Profil finns redan men kunde inte hämtas: " + fetchError.message);
            }

            console.log("[AuthScreen] Existing profile found:", existingProfile);
          } else {
            // Other errors (RLS, validation, etc.)
            const errorMessage = profileError.message || "Okänt fel";
            const errorCode = profileError.code || "UNKNOWN";
            const errorDetails = profileError.details || "";
            const errorHint = profileError.hint || "";
            
            // Build detailed error message
            let detailedMessage = `Profil kunde inte skapas (${errorCode}): ${errorMessage}`;
            if (errorDetails) {
              detailedMessage += `\nDetaljer: ${errorDetails}`;
            }
            if (errorHint) {
              detailedMessage += `\nTips: ${errorHint}`;
            }
            
            // Common error codes and their meanings
            if (errorCode === "PGRST116") {
              detailedMessage = "Profil hittades inte efter skapande. Kontrollera RLS-policies.";
            } else if (errorCode === "PGRST406" || errorCode === "42501") {
              detailedMessage = "Åtkomst nekad. Kontrollera RLS-policies för profiles-tabellen.";
            } else if (errorCode === "23503") {
              detailedMessage = "Foreign key-fel. Kontrollera att auth.users.id finns.";
            } else if (errorCode === "23514") {
              detailedMessage = "Valideringsfel. Kontrollera att role är 'coach' eller 'client'.";
            }
            
            console.error("[AuthScreen] Throwing detailed error:", detailedMessage);
            throw new Error(detailedMessage);
          }
        } else {
          console.log("[AuthScreen] Profile created successfully:", profileInsertData);
        }

        // Verify profile was created
        const { data: verifyProfile, error: verifyError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (verifyError) {
          console.error("[AuthScreen] Profile verification failed:", verifyError);
          throw new Error("Profil skapades men kunde inte verifieras: " + verifyError.message);
        }

        console.log("[AuthScreen] Profile verified:", verifyProfile);
        Alert.alert("Konto skapat", "Konto skapat! Profil skapad automatiskt. 🎉");
        console.log("[AuthScreen] Signup successful, user:", authData.user.id, "role:", role);
      } else {
        // Login
        console.log("[AuthScreen] Starting login process...");
        console.log("[AuthScreen] Email:", email.trim().toLowerCase());

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          console.error("[AuthScreen] Login error:", {
            message: error.message,
            status: error.status,
            code: error.code,
          });

          // Provide more specific error messages
          let userFriendlyMessage = error.message;
          if (error.message.includes("Invalid login credentials")) {
            userFriendlyMessage = "Fel e-post eller lösenord";
          } else if (error.message.includes("Email not confirmed")) {
            userFriendlyMessage = "E-postadressen är inte bekräftad. Kontrollera din inkorg.";
          } else if (error.status === 400) {
            userFriendlyMessage = "Ogiltiga inloggningsuppgifter";
          }

          throw new Error(userFriendlyMessage);
        }

        if (!data.user) {
          console.error("[AuthScreen] No user data returned from login");
          throw new Error("Ingen användardata returnerades från inloggning");
        }

        console.log("[AuthScreen] Login successful, user ID:", data.user.id);

        // Verify profile exists after login
        console.log("[AuthScreen] Verifying profile exists...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("[AuthScreen] Profile fetch error after login:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
          });

          if (profileError.code === "PGRST116") {
            // Profile doesn't exist
            Alert.alert(
              "Varning",
              "Du är inloggad men din profil saknas. Kontakta support."
            );
            console.warn("[AuthScreen] User logged in but profile is missing!");
          } else if (profileError.code === "PGRST406" || (profileError as any).status === 406) {
            // RLS blocked
            Alert.alert(
              "Åtkomst nekad",
              "Du är inloggad men har inte behörighet att läsa din profil. Kontakta support."
            );
            console.error("[AuthScreen] RLS blocked profile access!");
          } else {
            Alert.alert(
              "Varning",
              "Du är inloggad men profil kunde inte hämtas: " + profileError.message
            );
          }
        } else {
          console.log("[AuthScreen] Profile found:", {
            id: profile.id,
            role: profile.role,
            first_name: profile.first_name,
            last_name: profile.last_name,
          });
          Alert.alert("Inloggad", "Du är inloggad! 🎉");
        }
      }
    } catch (err: any) {
      console.error("[AuthScreen] Auth error caught:", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        status: err.status,
        details: err.details,
        hint: err.hint,
        name: err.name,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      });

      // Provide user-friendly error message
      let errorMessage = err.message || "Något gick fel";
      
      // If it's a network error
      if (err.message?.includes("Network") || err.message?.includes("fetch") || err.message?.includes("Failed to fetch")) {
        errorMessage = "Nätverksfel. Kontrollera din internetanslutning.";
      }
      
      // If it's a database error
      if (err.message?.includes("database") || err.message?.includes("saving") || err.code?.startsWith("PGRST") || err.code?.startsWith("23")) {
        // Already has detailed message from above, but ensure it's shown
        if (err.details) {
          errorMessage += `\n\nDetaljer: ${err.details}`;
        }
        if (err.hint) {
          errorMessage += `\n\nTips: ${err.hint}`;
        }
      }
      
      // If error code indicates RLS issue
      if (err.code === "PGRST406" || err.code === "42501" || (err as any).status === 406) {
        errorMessage = "Åtkomst nekad. Kontrollera RLS-policies i Supabase.\n\n" + errorMessage;
      }

      console.error("[AuthScreen] Showing error to user:", errorMessage);
      Alert.alert("Fel", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "signup" ? "Skapa konto" : "Logga in"}
      </Text>

      {mode === "signup" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Förnamn"
            value={first_name}
            onChangeText={setFirstName}
            autoCapitalize="words"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Efternamn"
            value={last_name}
            onChangeText={setLastName}
            autoCapitalize="words"
            editable={!loading}
          />

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === "coach" && styles.roleButtonActive]}
              onPress={() => setRole("coach")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "coach" && styles.roleButtonTextActive,
                ]}
              >
                Coach
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "client" && styles.roleButtonActive]}
              onPress={() => setRole("client")}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === "client" && styles.roleButtonTextActive,
                ]}
              >
                Klient
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "signup" ? "Skapa konto" : "Logga in"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => {
          setMode((prev: Mode) => (prev === "signup" ? "login" : "signup"));
        }}
        disabled={loading}
      >
        <Text style={styles.switchButtonText}>
          {mode === "signup"
            ? "Har du redan konto? Logga in"
            : "Har du inget konto? Skapa ett"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  roleButtonText: {
    fontSize: 16,
    color: "#333",
  },
  roleButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
    alignItems: "center",
  },
  switchButtonText: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

