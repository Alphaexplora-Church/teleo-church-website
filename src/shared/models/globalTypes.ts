/**
 * globalTypes.ts — Shared global business entities.
 * Consumed by 2+ features so it lives in the shared/models layer.
 * FORBIDDEN: React imports, hooks, state, or JSX.
 */

/**
 * Represents the feature flags stored in `church_profile.features_config` (JSONB).
 * Each key maps directly to an admin module the church may or may not have access to.
 */
export interface ChurchFeatures {
    prayer_wall: boolean;
    content_management: boolean;
    services: boolean;
    community: boolean;
    giving: boolean;
    events_announcement: boolean;
    registrations: boolean;
}
