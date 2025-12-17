"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ClientMobileHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("Klient");

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) {
          setUserName(data.full_name.split(" ")[0]);
        }
      }
    };
    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-[#5A6B5D] border-b border-[rgba(232,229,224,0.4)] shadow-sm">
      <span className="text-xl font-the-seasons font-bold text-[#FEFCF8]">JOMOA</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#FEFCF8] hidden sm:block">Hej, {userName}!</span>
        <Button variant="ghost" onClick={handleSignOut}>
          <User className="h-5 w-5 text-[#FEFCF8]" />
          <span className="sr-only">Profile / Logout</span>
        </Button>
      </div>
    </header>
  );
}
