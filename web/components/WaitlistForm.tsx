"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WaitlistFormProps = {
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

export default function WaitlistForm({ labels }: WaitlistFormProps) {
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
      const { error } = await supabase
        .from("waitlist_emails")
        .insert([{ email: email.trim().toLowerCase() }]);

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
    <Card className={cn(
      "rounded-2xl border-0 shadow-soft",
      "bg-jomoa-bg text-jomoa-text",
      "max-w-md w-full mx-auto"
    )}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-jomoa-text">
          {labels.title}
        </CardTitle>
        <CardDescription className="text-jomoa-muted">
          {labels.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder={labels.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={cn(
                "rounded-xl h-12",
                "bg-white border-jomoa-muted/20",
                "focus:border-jomoa-accent focus:ring-jomoa-accent/20",
                "text-jomoa-text placeholder:text-jomoa-muted"
              )}
              required
            />
          </div>

          {status.message && (
            <div
              className={cn(
                "rounded-xl p-3 text-sm",
                status.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {status.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-xl h-12",
              "bg-jomoa-accent hover:bg-jomoa-accent2",
              "text-white font-medium",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? labels.buttonLoading : labels.buttonIdle}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

