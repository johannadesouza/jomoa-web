"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ClientBottomNav } from "@/components/layout/ClientBottomNav";
import { ClientMobileHeader } from "@/components/layout/ClientMobileHeader";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      checkUserRole();
    }
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
        router.push("/login");
        return;
      }

      if (profile?.role !== "client") {
        if (profile?.role === "coach") {
          router.push("/coach/dashboard");
        } else {
          router.push("/login");
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
    <div className="min-h-screen bg-[#5A6B5D] flex flex-col md:flex-row">
      <ClientMobileHeader />
      <ClientBottomNav />
      <main className="flex-1 min-w-0 pb-20 md:pb-8 md:px-6 md:py-6">
        {children}
      </main>
    </div>
  );
}
