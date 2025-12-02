import { NextRequest, NextResponse } from "next/server";

/**
 * Mailchimp API Integration
 * 
 * This endpoint handles adding email addresses to Mailchimp lists.
 * 
 * Required environment variables:
 * - MAILCHIMP_API_KEY: Your Mailchimp API key
 * - MAILCHIMP_LIST_ID: Your Mailchimp audience/list ID
 * - MAILCHIMP_SERVER_PREFIX: Your Mailchimp server prefix (e.g., "us1", "us2", etc.)
 * 
 * The API key should be in the format: "your-api-key-us1"
 * The server prefix is usually the last part of your API key after the dash
 */

interface MailchimpRequest {
  email: string;
  firstName?: string;
  locale?: "en" | "sv";
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: MailchimpRequest = await request.json();
    const { email, firstName, locale = "sv", tags = [] } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get environment variables
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!apiKey || !listId) {
      console.error("Mailchimp configuration missing");
      return NextResponse.json(
        { error: "Mailchimp not configured" },
        { status: 500 }
      );
    }

    // Extract server prefix from API key if not provided separately
    // API key format: "your-api-key-us1" or "your-api-key-us2"
    const server = serverPrefix || apiKey.split("-").pop() || "us1";
    const mailchimpUrl = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;

    // Prepare Mailchimp payload
    const mailchimpPayload = {
      email_address: email.toLowerCase().trim(),
      status: "subscribed", // or "pending" if you want double opt-in
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: firstName?.trim() || "",
        // Add custom merge fields if you have them set up in Mailchimp
        // For example:
        // LANG: locale.toUpperCase(),
      },
      tags: ["waitlist", locale, ...tags],
      language: locale === "sv" ? "sv" : "en",
    };

    // Call Mailchimp API
    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailchimpPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle Mailchimp errors
      if (data.title === "Member Exists") {
        // Email already exists - this is okay, we can treat it as success
        return NextResponse.json(
          { 
            success: true, 
            message: "Email already subscribed",
            duplicate: true 
          },
          { status: 200 }
        );
      }

      console.error("Mailchimp API error:", data);
      return NextResponse.json(
        { 
          error: "Failed to subscribe email",
          details: data.detail || data.title 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully subscribed to Mailchimp",
        mailchimpId: data.id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mailchimp subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

