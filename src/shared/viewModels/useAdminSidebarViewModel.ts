import { useAuth } from '../context/useAuth';
import type { ChurchFeatures } from '../models/globalTypes';

/**
 * useAdminSidebarViewModel
 *
 * Bridges the global auth state to the AdminSidebar view.
 * Reads the church's feature flags from AuthContext and exposes
 * simple boolean flags so the view never has to touch raw data directly.
 *
 * When `features` is null (e.g. session expired or not loaded),
 * all features default to FALSE for safety.
 */
export function useAdminSidebarViewModel() {
    const { features } = useAuth();

    /**
     * Helper: returns the feature flag value or false as a safe fallback.
     * This prevents the sidebar from showing locked features if the
     * features_config was not returned by the backend.
     */
    const can = (feature: keyof ChurchFeatures): boolean => features?.[feature] ?? false;

    return {
        /** Show the Prayer Wall management link */
        showPrayerWall: can('prayer_wall'),
        /** Show the Content Management link */
        showContentManagement: can('content_management'),
        /** Show the Services link */
        showServices: can('services'),
        /** Show the Community link */
        showCommunity: can('community'),
        /** Show the Giving link */
        showGiving: can('giving'),
        /** Show the Events & Announcements link */
        showEventsAnnouncement: can('events_announcement'),
        /** Show the Registrations link */
        showRegistrations: can('registrations'),
    };
}
