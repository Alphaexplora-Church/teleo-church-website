/**
 * globalTypes.ts — Shared global business entities.
 * Consumed by 2+ features so it lives in the shared/models layer.
 * FORBIDDEN: React imports, hooks, state, or JSX.
 */
import type { FeaturesConfig } from './auth';

/**
 * Single Source of Truth for feature flags is FeaturesConfig in auth.ts.
 * ChurchFeatures is preserved as an alias for backwards compatibility.
 */
export type ChurchFeatures = FeaturesConfig;
export type { FeaturesConfig };

