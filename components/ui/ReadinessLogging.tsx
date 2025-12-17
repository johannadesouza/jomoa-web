"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "./Drawer";
import { Button } from "./Button";
import { X } from "lucide-react";

interface ReadinessLoggingProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  initialValues?: {
    sleep_quality: number | null;
    energy_level: number | null;
    stress_level: number | null;
    soreness: number | null;
    notes: string | null;
  };
}

export function ReadinessLogging({
  clientId,
  open,
  onOpenChange,
  onSave,
  initialValues,
}: ReadinessLoggingProps) {
  const [sleepQuality, setSleepQuality] = useState(initialValues?.sleep_quality ?? 5);
  const [energyLevel, setEnergyLevel] = useState(initialValues?.energy_level ?? 5);
  const [stressLevel, setStressLevel] = useState(initialValues?.stress_level ?? 5);
  const [soreness, setSoreness] = useState(initialValues?.soreness ?? 5);
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setSleepQuality(initialValues.sleep_quality ?? 5);
      setEnergyLevel(initialValues.energy_level ?? 5);
      setStressLevel(initialValues.stress_level ?? 5);
      setSoreness(initialValues.soreness ?? 5);
      setNotes(initialValues.notes ?? "");
    }
  }, [initialValues, open]);

  const handleSave = async () => {
    if (!clientId) {
      setError("Klient-ID saknas.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];

      const { error: upsertError } = await supabase
        .from("daily_readiness")
        .upsert(
          {
            client_id: clientId,
            date: today,
            sleep_quality: sleepQuality,
            energy_level: energyLevel,
            stress_level: stressLevel,
            soreness: soreness,
            notes: notes.trim() || null,
          },
          {
            onConflict: "client_id,date",
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      onSave?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error saving readiness:", err);
      setError(err.message || "Kunde inte spara readiness. Försök igen senare.");
    } finally {
      setSaving(false);
    }
  };

  const Slider = ({
    label,
    value,
    onChange,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon?: string;
  }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#5A6B5D]">{label}</label>
          <span className="text-sm font-the-seasons font-bold text-[#5A6B5D]">{value}/10</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#E8E5E0] rounded-full appearance-none cursor-pointer accent-[#8B6F47]"
          style={{
            background: `linear-gradient(to right, #8B6F47 0%, #8B6F47 ${(value / 10) * 100}%, #E8E5E0 ${(value / 10) * 100}%, #E8E5E0 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#5A6B5D]/60">
          <span>0</span>
          <span>10</span>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="bottom" className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Logga din readiness</DrawerTitle>
          <DrawerDescription>
            Hur mår du idag? Detta hjälper din coach att anpassa träningen.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50/50 border border-red-200 rounded-card">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Slider
            label="Sömnkvalitet"
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          <Slider
            label="Energi"
            value={energyLevel}
            onChange={setEnergyLevel}
          />

          <Slider
            label="Stress"
            value={stressLevel}
            onChange={setStressLevel}
          />

          <Slider
            label="Muskelömhet"
            value={soreness}
            onChange={setSoreness}
          />

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-[#5A6B5D]">
              Anteckning (valfritt)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Hur känner du dig idag? Något särskilt att tänka på?"
              className="w-full min-h-[80px] px-3 py-2 rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-sm text-[#5A6B5D] placeholder:text-[#5A6B5D]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47] resize-none"
            />
          </div>
        </div>

        <DrawerFooter className="flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="flex-1"
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Sparar..." : "Spara"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

