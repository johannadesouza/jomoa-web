"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

export default function DebugRolePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error:", error);
        setProfile({ error: error.message, code: error.code });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error:", err);
      setProfile({ error: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const fixRole = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "coach" })
        .eq("id", user.id);

      if (error) {
        alert("Fel: " + error.message);
      } else {
        alert("Roll uppdaterad till 'coach'! Ladda om sidan.");
        await fetchProfile();
      }
    } catch (err) {
      alert("Fel: " + getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="p-8">Laddar...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug: User Role</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="font-semibold mb-2">User Info</h2>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({ id: user?.id, email: user?.email }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Profile Info</h2>
          {profile?.error ? (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600">Fel: {profile.error}</p>
              {profile.code && <p className="text-sm text-red-500">Code: {profile.code}</p>}
            </div>
          ) : (
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>

        {profile && !profile.error && (
          <div>
            <h2 className="font-semibold mb-2">Current Role</h2>
            <div className={`p-3 rounded ${
              profile.role === "coach" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}>
              <p className="font-medium">{profile.role || "null/undefined"}</p>
            </div>
          </div>
        )}

        {profile && (!profile.role || profile.role !== "coach") && (
          <div>
            <button
              onClick={fixRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fixa: Sätt roll till "coach"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

