import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

// This should be called periodically (e.g., via cron job or scheduled task)
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
    );

    // Call the database function to check for missing readiness
    const { error } = await supabase.rpc("check_missing_readiness");

    if (error) {
      console.error("Error checking missing readiness:", error);
      return NextResponse.json(
        { error: "Kunde inte kontrollera saknad readiness" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in check-missing route:", err);
    return NextResponse.json(
      { error: getErrorMessage(err) || "Ett fel uppstod" },
      { status: 500 }
    );
  }
}

