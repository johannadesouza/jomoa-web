"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// EXACT JOMOA Brand Colors
const colors = {
  softPink: "#FFFBF7",
  terracotta: "#D96D46",
  sand: "#FEE7AB",
  plum: "#462324",
  mauve: "#BA8E90",
  pinkLight: "#F0D6D7",
  mauveDark: "#976568",
  terracottaLight: "#FDB499",
  border: "#E8D5D0",
  text: "#462324",
  textSecondary: "#4E4A48",
};

// JOMOA Spacing System
const spacing = {
  xs: "8px",
  s: "12px",
  m: "24px",
  l: "32px",
  xl: "48px",
};

type WaitlistFormProps = {
  locale: "en" | "sv";
  inline?: boolean; // For inline layout on desktop (input + button on same row)
  labels: {
    title: string;
    description: string;
    firstNamePlaceholder: string;
    emailPlaceholder: string;
    buttonIdle: string;
    buttonLoading: string;
    success: string;
    duplicateError: string;
    genericError: string;
    validationError: string;
    emptyError: string;
    firstNameError?: string;
  };
};

export default function WaitlistForm({ locale, labels, inline = false }: WaitlistFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim()) {
      setStatus({ type: "error", message: labels.firstNameError || labels.emptyError });
      return;
    }
    
    if (!email.trim()) {
      setStatus({ type: "error", message: labels.emptyError });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: "error", message: labels.validationError });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedFirstName = firstName.trim();
      
      // Step 1: Add to Mailchimp (primary)
      let mailchimpSuccess = false;
      let mailchimpDuplicate = false;
      
      try {
        const mailchimpResponse = await fetch("/api/mailchimp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
            firstName: trimmedFirstName,
            locale,
            tags: ["waitlist"],
          }),
        });

        const mailchimpData = await mailchimpResponse.json();
        
        if (mailchimpResponse.ok || mailchimpData.duplicate) {
          mailchimpSuccess = true;
          mailchimpDuplicate = mailchimpData.duplicate || false;
        } else {
          // Log error for debugging
          console.error("Mailchimp API error:", {
            status: mailchimpResponse.status,
            data: mailchimpData,
          });
        }
      } catch (mailchimpError) {
        // Mailchimp failed, but we'll still try Supabase as backup
        console.error("Mailchimp subscription failed, using Supabase backup:", mailchimpError);
      }

      // Step 2: Also save to Supabase (backup/database)
      // Try with first_name, if that fails, try without it (for backwards compatibility)
      let supabaseData = null;
      let supabaseError = null;
      
      // First try with first_name
      const insertData: any = { 
        email: trimmedEmail,
        locale 
      };
      
      // Only add first_name if it exists in the table
      // We'll try with it first, and if it fails with column error, retry without it
      const { data: dataWithName, error: errorWithName } = await supabase
        .from("waitlist_emails")
        .insert([{ 
          ...insertData,
          first_name: trimmedFirstName,
        }])
        .select();
      
      if (errorWithName && errorWithName.code === "PGRST204" && errorWithName.message?.includes("first_name")) {
        // Column doesn't exist, try without first_name
        console.warn("first_name column not found, inserting without it");
        const { data: dataWithoutName, error: errorWithoutName } = await supabase
          .from("waitlist_emails")
          .insert([insertData])
          .select();
        supabaseData = dataWithoutName;
        supabaseError = errorWithoutName;
      } else {
        supabaseData = dataWithName;
        supabaseError = errorWithName;
      }

      // Determine final status
      if (supabaseError) {
        // Handle duplicate email error (PostgreSQL unique constraint violation)
        if (supabaseError.code === "23505") {
          // Email already exists in Supabase
          if (mailchimpSuccess && !mailchimpDuplicate) {
            // Mailchimp succeeded, but Supabase has duplicate - still show success
            setStatus({
              type: "success",
              message: labels.success,
            });
            setEmail("");
            setFirstName("");
          } else {
            // Both have duplicate or error
            setStatus({
              type: "error",
              message: labels.duplicateError,
            });
          }
        } else {
          // Other Supabase error
          console.error("Supabase error:", {
            code: supabaseError.code,
            message: supabaseError.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
          });
          
          // Check if it's a column/table issue
          if (supabaseError.code === "42P01" || supabaseError.message?.includes("does not exist")) {
            console.error("Table or column does not exist. Check Supabase schema.");
          }
          
          if (mailchimpSuccess) {
            // Mailchimp worked, Supabase failed - still show success
            setStatus({
              type: "success",
              message: labels.success,
            });
            setEmail("");
            setFirstName("");
          } else {
            // Both failed - show error with more details in dev mode
            const errorMessage = process.env.NODE_ENV === "development" 
              ? `${labels.genericError} (${supabaseError.message || supabaseError.code || "Unknown error"})`
              : labels.genericError;
            setStatus({
              type: "error",
              message: errorMessage,
            });
          }
        }
      } else {
        // Supabase success
        if (mailchimpSuccess && mailchimpDuplicate) {
          // Mailchimp says duplicate but Supabase succeeded - show duplicate message
          setStatus({
            type: "error",
            message: labels.duplicateError,
          });
        } else {
          // Both succeeded or Mailchimp failed but Supabase worked
        setStatus({
          type: "success",
          message: labels.success,
        });
        setEmail("");
          setFirstName("");
        }
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: labels.genericError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex gap-4",
        inline ? "flex-col md:flex-row" : "flex-col"
      )}
    >
      <div className={cn("flex-1", inline && "md:flex-1", "space-y-3")}>
        {/* First Name */}
        <Input
          type="text"
          placeholder={labels.firstNamePlaceholder}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          className={cn(
            "w-full rounded-[32px] font-league-spartan font-normal",
            "bg-white border-2",
            "focus:ring-2 focus:ring-offset-0 focus:ring-[#D96D46]",
            "placeholder:text-[#725A5A] placeholder:opacity-60",
            "transition-all duration-300 hover:border-[#D96D46]"
          )}
          style={{ 
            borderColor: colors.border,
            color: colors.text,
            padding: "18px 28px",
            fontSize: "18px",
            height: "64px",
            lineHeight: "1.5",
            backgroundColor: "#FFFFFF"
          }}
          required
        />
        
        {/* Email */}
            <Input
              type="email"
          placeholder={labels.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={cn(
            "w-full rounded-[32px] font-league-spartan font-normal",
            "bg-white border-2",
            "focus:ring-2 focus:ring-offset-0 focus:ring-[#D96D46]",
            "placeholder:text-[#725A5A] placeholder:opacity-60",
            "transition-all duration-300 hover:border-[#D96D46]"
          )}
          style={{ 
            borderColor: colors.border,
            color: colors.text,
            padding: "18px 28px",
            fontSize: "18px",
            height: "64px",
            lineHeight: "1.5",
            backgroundColor: "#FFFFFF"
          }}
              required
            />
          </div>

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "rounded-full font-league-spartan font-semibold",
          "text-white",
          "transition-all duration-200 ease-out hover:opacity-90 hover:scale-[1.02]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          inline ? "w-full md:w-auto md:flex-shrink-0" : "w-full"
        )}
        style={{ 
          background: colors.terracotta,
          boxShadow: `0 4px 16px ${colors.terracotta}30`,
          padding: "18px 36px",
          fontSize: "18px",
          height: "64px",
          lineHeight: "1.5"
        }}
      >
        {loading ? labels.buttonLoading : labels.buttonIdle}
      </Button>

          {status.message && (
            <div
              className={cn(
            "rounded-[24px] font-league-spartan font-normal w-full",
            inline ? "md:col-span-2" : ""
          )}
          style={{
            backgroundColor: status.type === "success" ? "#F0F9F4" : "#FEF2F2",
            color: status.type === "success" ? "#166534" : "#991B1B",
            borderColor: status.type === "success" ? "#BBF7D0" : "#FECACA",
            borderWidth: "1px",
            padding: spacing.m,
            fontSize: "15px",
            lineHeight: "1.5"
          }}
            >
              {status.message}
            </div>
          )}
        </form>
  );
}
