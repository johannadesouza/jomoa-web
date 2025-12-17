import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

// Create client directly (coach creates client account)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, date_of_birth, gender, coach_id } = body;

    if (!email || !name || !coach_id) {
      return NextResponse.json(
        { error: "Email, namn och coach_id är obligatoriska" },
        { status: 400 }
      );
    }

    // Validera email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ogiltig email-adress" },
        { status: 400 }
      );
    }

    // Använd service role key för admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Skapa auth user
    // Generera temporärt lösenord (användaren kan ändra det senare)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + "A1!";
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Det finns redan ett konto med denna email" },
          { status: 400 }
        );
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Kunde inte skapa användare");
    }

    // 2. Uppdatera profile med namn och role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: name.trim(),
        role: "client",
        onboarding_stage: "not_started",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      // Om profile inte finns, skapa den
      const { error: createProfileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: name.trim(),
          role: "client",
          onboarding_stage: "not_started",
        });

      if (createProfileError) {
        console.error("Error creating profile:", createProfileError);
        // Fortsätt ändå, profile kan uppdateras senare
      }
    }

    // 3. Skapa client record
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        profile_id: authData.user.id,
        primary_coach_id: coach_id,
        date_of_birth: date_of_birth || null,
        gender: gender || "other",
        status: "active",
        onboarding_stage: "not_started",
      })
      .select()
      .single();

    if (clientError) {
      console.error("Error creating client:", clientError);
      // Försök ta bort auth user om client creation misslyckades
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw clientError;
    }

    // 4. Skapa invite record för att spåra att klienten skapades direkt (optional)
    // Detta hjälper med historik och analytics

    return NextResponse.json({
      success: true,
      client: {
        id: clientData.id,
        email: authData.user.email,
        name: name.trim(),
      },
      tempPassword: tempPassword, // Returnera temporärt lösenord så coach kan skicka det till klienten
      message: "Klient skapad. Glöm inte att skicka lösenordet till klienten.",
    });
  } catch (err) {
    console.error("Error creating client:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Kunde inte skapa klient. Försök igen senare." },
      { status: 500 }
    );
  }
}

