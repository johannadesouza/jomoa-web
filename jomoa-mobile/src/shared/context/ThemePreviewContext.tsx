/**
 * Under onboarding används detta för att förhandsgranska vald stil (bold/soft/neutral)
 * så att färgerna uppdateras direkt när användaren väljer. Utanför onboarding är värdet null.
 */

import React, { createContext, useContext } from "react";
import type { PresentationTheme } from "../types/onboarding";

const ThemePreviewContext = createContext<PresentationTheme | null>(null);

export function ThemePreviewProvider({
  value,
  children,
}: {
  value: PresentationTheme | null;
  children: React.ReactNode;
}) {
  return (
    <ThemePreviewContext.Provider value={value}>
      {children}
    </ThemePreviewContext.Provider>
  );
}

export function useThemePreview(): PresentationTheme | null {
  return useContext(ThemePreviewContext);
}
