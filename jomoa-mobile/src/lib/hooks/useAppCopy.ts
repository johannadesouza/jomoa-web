/**
 * useAppCopy – hämtar profilvarierande apptexter (presentation_profile).
 * profileOverride: använd under onboarding (t.ex. data.presentationProfile) så att copy matchar valt kön innan client sparats.
 * Fallback: först profil, sedan neutral. Helper: getAppCopy(copy, key, fallback).
 */
import { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import type { PresentationProfile } from "../../shared/types/onboarding";
import { fetchAppCopy, type AppCopyLocale } from "../repos/contentRepo/appCopy";

const CACHE: {
  locale: AppCopyLocale;
  profile: string | null;
  copy: Record<string, string> | null;
} = {
  locale: "sv",
  profile: null,
  copy: null,
};

function toProfile(s: string | null | undefined): PresentationProfile {
  return s === "male" || s === "female" || s === "neutral" ? s : "neutral";
}

export function useAppCopy(locale: AppCopyLocale = "sv", profileOverride?: PresentationProfile | null) {
  const { client } = useAuth();
  const effectiveProfile = toProfile(profileOverride ?? client?.presentation_profile ?? "neutral");
  const [copy, setCopy] = useState<Record<string, string>>(
    CACHE.locale === locale && CACHE.profile === effectiveProfile && CACHE.copy ? CACHE.copy : {}
  );

  useEffect(() => {
    if (CACHE.locale === locale && CACHE.profile === effectiveProfile && CACHE.copy) {
      setCopy(CACHE.copy);
      return;
    }
    fetchAppCopy(locale, effectiveProfile)
      .then((c) => {
        CACHE.locale = locale;
        CACHE.profile = effectiveProfile;
        CACHE.copy = c;
        setCopy(c);
      })
      .catch(() => setCopy({}));
  }, [locale, effectiveProfile]);

  return copy;
}

/** Returnerar värde för key med fallback. */
export function getAppCopy(copy: Record<string, string>, key: string, fallback: string): string {
  return copy[key] ?? fallback;
}
