/**
 * Optional Sentry integration for crash reporting.
 * App runs normally when @sentry/react-native is not installed or DSN is not set.
 */
import type React from "react";

// Optional dependency: app works without it when not installed or DSN unset
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  // @ts-expect-error - optional; module may not be installed
  Sentry = require("@sentry/react-native");
} catch {
  // Package not installed
}

let sentryInitialized = false;

export function initSentry(dsn: string): void {
  if (Sentry && dsn) {
    Sentry.init({
      dsn,
      enableInNativeReleases: true,
      tracesSampleRate: 0,
    });
    sentryInitialized = true;
  }
}

/** Only wrap when Sentry.init() was called, to avoid "wrap called before init" warning. */
export function wrapWithSentry<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return Sentry && sentryInitialized ? Sentry.wrap(Component) : Component;
}
