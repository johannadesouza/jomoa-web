/**
 * DataScreen – wrapper för vanligt mönster: laddning → fel → tom → innehåll.
 * Minskar duplicerad if/return för LoadingScreen, ErrorState och EmptyState.
 */
import React from "react";
import { Screen } from "./Screen";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

export interface DataScreenProps {
  /** Visa laddningsindikator */
  loading?: boolean;
  /** Felmeddelande (sträng eller null); om satt visas ErrorState */
  error?: string | null;
  /** Visa tom-state istället för innehåll */
  empty?: boolean;
  /** Meddelande under laddning */
  loadingMessage?: string;
  /** Rubrik för felstate */
  errorTitle?: string;
  /** Retry-knapp; om satt visas knapp med retryLabel */
  onRetry?: () => void;
  /** Etikett för retry-knapp */
  retryLabel?: string;
  /** Rubrik för tom-state */
  emptyTitle?: string;
  /** Beskrivning för tom-state */
  emptyDescription?: string;
  /** Etikett för action-knapp i tom-state */
  emptyActionLabel?: string;
  /** Callback för action i tom-state */
  onEmptyAction?: () => void;
  /** Innehåll när inte loading/error/empty */
  children: React.ReactNode;
}

/**
 * Visar LoadingScreen, ErrorState eller EmptyState när det passar; annars children.
 * Använd när en skärm hämtar data och har tydliga laddnings-/fel-/tom-tillstånd.
 */
export function DataScreen({
  loading = false,
  error = null,
  empty = false,
  loadingMessage = "Laddar...",
  errorTitle = "Något gick fel",
  onRetry,
  retryLabel = "Försök igen",
  emptyTitle = "Inget innehåll",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  children,
}: DataScreenProps) {
  if (loading) return <LoadingScreen message={loadingMessage} />;

  if (error) {
    return (
      <Screen padded centered>
        <ErrorState
          title={errorTitle}
          description={error}
          retryLabel={retryLabel}
          onRetry={onRetry}
        />
      </Screen>
    );
  }

  if (empty) {
    return (
      <Screen padded centered>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </Screen>
    );
  }

  return <>{children}</>;
}
