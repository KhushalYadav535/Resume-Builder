/**
 * UpRole Analytics — Pulse Dashboard Event Stubs (Section 25)
 *
 * These are provider-agnostic stubs. To connect to a real analytics provider
 * (e.g. Mixpanel, Segment, PostHog), replace the `track()` implementation below.
 *
 * The north-star principle: DO NOT optimize for clicks or time-spent.
 * Analytics should measure whether Pulse leads to meaningful career behaviour.
 */

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

function track(event: string, properties?: AnalyticsProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, properties ?? {});
  }

  // TODO: Connect to your analytics provider
  // Example — Mixpanel:
  //   mixpanel.track(event, properties);
  // Example — PostHog:
  //   posthog.capture(event, properties);
  // Example — Segment:
  //   analytics.track(event, properties);
}

// ─── Pulse Page Events ─────────────────────────────────────────────────────

export function trackPulseViewed(scenario?: string) {
  track("pulse_viewed", { scenario });
}

// ─── Career Component Open Events ──────────────────────────────────────────

export function trackCareerSnapshotOpened() {
  track("career_snapshot_opened");
}

export function trackCareerValueOpened() {
  track("career_value_opened");
}

export function trackCareerProgressOpened() {
  track("career_progress_opened");
}

export function trackCareerEventOpened(eventId?: string) {
  track("career_event_opened", { eventId });
}

export function trackCareerDirectionOpened() {
  track("career_direction_opened");
}

export function trackCareerGoalOpened() {
  track("career_goal_opened");
}

// ─── Next Best Action Events ────────────────────────────────────────────────

export function trackNextBestActionViewed(actionTitle: string, actionType: string) {
  track("next_best_action_viewed", { actionTitle, actionType });
}

export function trackNextBestActionAccepted(actionTitle: string, actionType: string) {
  track("next_best_action_accepted", { actionTitle, actionType });
}

export function trackNextBestActionCompleted(actionTitle: string) {
  track("next_best_action_completed", { actionTitle });
}

export function trackNextBestActionDismissed(actionTitle: string) {
  track("next_best_action_dismissed", { actionTitle });
}

// ─── Career Exploration Events ──────────────────────────────────────────────

export function trackCareerExplorationOpened() {
  track("career_exploration_opened");
}

export function trackCareerDirectionSelected(role: string, alignment: string) {
  track("career_direction_selected", { role, alignment });
}

// ─── AI Traceability Events ─────────────────────────────────────────────────

export function trackAiExplanationOpened(componentTitle: string) {
  track("ai_explanation_opened", { componentTitle });
}

export function trackAiInterpretationAccepted(componentTitle: string) {
  track("ai_interpretation_accepted", { componentTitle });
}

export function trackAiInterpretationEdited(componentTitle: string) {
  track("ai_interpretation_edited", { componentTitle });
}

export function trackAiInterpretationRejected(componentTitle: string) {
  track("ai_interpretation_rejected", { componentTitle });
}

// ─── Career Creation Events ─────────────────────────────────────────────────

export function trackCareerEventCreatedFromPulse(capability: string) {
  track("career_event_created_from_pulse", { capability });
}

export function trackCareerGoalCreatedFromPulse(goalLabel: string) {
  track("career_goal_created_from_pulse", { goalLabel });
}
