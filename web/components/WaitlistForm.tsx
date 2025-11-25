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
    placeholder: string;
    buttonIdle: string;
    buttonLoading: string;
    success: string;
    duplicateError: string;
    genericError: string;
    validationError: string;
    emptyError: string;
  };
};

export default function WaitlistForm({ locale, labels, inline = false }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { error } = await supabase
        .from("waitlist_emails")
        .insert([{ email: trimmedEmail, locale }]);

      if (error) {
        // Handle duplicate email error (PostgreSQL unique constraint violation)
        if (error.code === "23505") {
          setStatus({
            type: "error",
            message: labels.duplicateError,
          });
        } else {
          setStatus({
            type: "error",
            message: labels.genericError,
          });
        }
      } else {
        setStatus({
          type: "success",
          message: labels.success,
        });
        setEmail("");
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
      <div className={cn("flex-1", inline && "md:flex-1")}>
        <Input
          type="email"
          placeholder={labels.placeholder}
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
