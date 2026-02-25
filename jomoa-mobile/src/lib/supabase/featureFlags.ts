/**
 * Feature flags för Content DB-separation.
 *
 * FAS 1–2: USE_SEPARATE_CONTENT_DB = false → appen läser content från User DB (bakåtkompatibelt)
 * FAS 3:   USE_SEPARATE_CONTENT_DB = true  → appen läser content från Content DB
 *
 * Sätt EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB=true i .env när Content DB är verifierad.
 */
export const USE_SEPARATE_CONTENT_DB =
  process.env.EXPO_PUBLIC_USE_SEPARATE_CONTENT_DB === "true";
