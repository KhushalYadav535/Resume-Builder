"use client";

export type ValueAnalyticsEvent =
  | "value_dashboard_viewed"
  | "value_dimension_opened"
  | "value_pattern_viewed"
  | "value_explanation_opened"
  | "value_fact_viewed"
  | "value_fact_confirmed"
  | "value_fact_edited"
  | "value_fact_rejected"
  | "value_interpretation_accepted"
  | "value_interpretation_edited"
  | "value_interpretation_rejected"
  | "value_evidence_viewed"
  | "value_extraction_started"
  | "value_extraction_completed"
  | "value_derivation_started"
  | "value_derivation_completed";

export function trackValueEvent(
  event: ValueAnalyticsEvent,
  payload?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  try {
    // Send to global gtag or custom event dispatcher if available
    const win = window as any;
    if (typeof win.gtag === "function") {
      win.gtag("event", event, payload || {});
    }

    // Custom window event for reactive telemetry listeners
    window.dispatchEvent(
      new CustomEvent("uprole_analytics", {
        detail: { event, payload, timestamp: Date.now() },
      })
    );

    // Development logging
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telemetry:Value] ${event}`, payload || {});
    }
  } catch (err) {
    // Silent fail for non-blocking telemetry
  }
}
