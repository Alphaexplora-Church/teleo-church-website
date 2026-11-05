/**
 * Meaningful domain empty state copies and configurations for Discipleship Applications.
 * Universal UI words (e.g. "Reject", "Close", "Cancel") are kept directly in JSX.
 */
export const DISCIPLESHIP_APPLICATIONS_EMPTY_STATES = {
  noPendingApplications: "No pending discipleship applications",
  emptyApplicationsSubtext:
    "When church members submit an intake form, their applications will appear here for group placement.",
  emptyIntakeQuestionsTitle: "No intake questions configured",
  emptyIntakeQuestionsDescription:
    "Add your first question to collect intake information from applicants.",
} as const;

export const MAX_INTAKE_QUESTIONS = 5;
export const MAX_QUESTION_CHARS = 250;


