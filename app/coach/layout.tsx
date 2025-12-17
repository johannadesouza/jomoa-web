"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CoachSidebar } from "@/components/layout/CoachSidebar";
import { CoachTopbar } from "@/components/layout/CoachTopbar";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      checkUserRole();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  const checkUserRole = async () => {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === "PGRST116") {
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              role: "coach",
            });
          
          if (createError) {
            console.error("Error creating profile:", createError);
            router.push("/login");
            return;
          }
          setCheckingRole(false);
          return;
        }
        router.push("/login");
        return;
      }

      if (profile?.role !== "coach") {
        console.log("User role is not coach:", profile?.role);
        if (profile?.role === "client") {
          router.push("/client/dashboard");
        } else {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: "coach" })
            .eq("id", user.id);
          
          if (updateError) {
            console.error("Error updating role:", updateError);
            router.push("/login");
            return;
          }
          setCheckingRole(false);
        }
        return;
      }

      setCheckingRole(false);
    } catch (err) {
      console.error("Error checking role:", err);
      router.push("/login");
    }
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <p className="text-[#FEFCF8]/70">Laddar...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#5A6B5D]">
      <CoachTopbar />
      <CoachSidebar />
      <main className="flex-1 min-w-0 bg-[#FEFCF8]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
