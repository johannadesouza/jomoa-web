/**
 * useOnboardingCopy – hämtar onboarding-texter från Content DB med fallback.
 * Cachar resultat så att vi inte anropar på varje skärm.
 */
import { useState, useEffect } from "react";
import { fetchOnboardingCopy, type OnboardingCopyLocale } from "../repos/contentRepo";

const CACHE: { locale: OnboardingCopyLocale; copy: Record<string, string> | null } = {
  locale: "sv",
  copy: null,
};

export function useOnboardingCopy(locale: OnboardingCopyLocale = "sv") {
  const [copy, setCopy] = useState<Record<string, string>>(locale === CACHE.locale && CACHE.copy ? CACHE.copy : {});

  useEffect(() => {
    if (CACHE.locale === locale && CACHE.copy) {
      setCopy(CACHE.copy);
      return;
    }
    fetchOnboardingCopy(locale)
      .then((c) => {
        CACHE.locale = locale;
        CACHE.copy = c;
        setCopy(c);
      })
      .catch(() => setCopy({}));
  }, [locale]);

  return copy;
}

/** Returnerar värde för key med fallback. */
export function getCopy(copy: Record<string, string>, key: string, fallback: string): string {
  return copy[key] ?? fallback;
}
