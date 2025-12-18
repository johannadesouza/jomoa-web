import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

// Accept invite and create client record (using service role to bypass RLS)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, user_id } = body;

    if (!token || !user_id) {
      return NextResponse.json(
        { error: "Token och user_id är obligatoriska" },
        { status: 400 }
      );
    }

    // Använd service role key för admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Hämta invite information
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from("invites")
      .select("invited_by_profile_id, organization_id, email, role")
      .eq("token", token)
      .is("accepted_at", null)
      .single();

    if (inviteError || !inviteData) {
      return NextResponse.json(
        { error: "Ogiltig eller redan accepterad inbjudan" },
        { status: 400 }
      );
    }

    // 2. Uppdatera profile till client role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "client",
        onboarding_stage: "started",
      })
      .eq("id", user_id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Kunde inte uppdatera profil" },
        { status: 500 }
      );
    }

    // 3. Kontrollera om client redan finns
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("profile_id", user_id)
      .maybeSingle();

    if (!existingClient) {
      // 4. Skapa client record
      const { error: clientError } = await supabaseAdmin
        .from("clients")
        .insert({
          profile_id: user_id,
          primary_coach_id: inviteData.invited_by_profile_id,
          status: "active",
          onboarding_stage: "started",
        });

      if (clientError) {
        console.error("Error creating client:", clientError);
        return NextResponse.json(
          { error: "Kunde inte skapa klient" },
          { status: 500 }
        );
      }
    }

    // 5. Markera invite som accepterad
    const { error: acceptError } = await supabaseAdmin
      .from("invites")
      .update({
        accepted_at: new Date().toISOString(),
      })
      .eq("token", token);

    if (acceptError) {
      console.error("Error marking invite as accepted:", acceptError);
      // Fortsätt ändå, client är skapad
    }

    return NextResponse.json({
      success: true,
      message: "Inbjudan accepterad",
    });
  } catch (err) {
    console.error("Error accepting invite:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Kunde inte acceptera inbjudan" },
      { status: 500 }
    );
  }
}

