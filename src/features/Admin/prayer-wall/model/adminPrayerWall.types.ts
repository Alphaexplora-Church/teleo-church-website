export type PrayerAudience = 'PUBLIC' | 'PRIVATE' | 'HOME_CHURCH';

export interface PrayerTimeMetadata {
    date: string;
    time: string;
    day: string;
    relative_time: string;
}

export interface AdminPrayer {
    id: string;
    user_id: string;
    home_church_id: number | null;
    title: string;
    audience: PrayerAudience;
    description: string;
    prayer_tag: string | null;
    is_answered: boolean;
    answer_note: string | null;
    answered_at: string | null;
    created_at: string;
    updated_at: string;
    reactions_count: number;
    author_name: string | null;
    author_profile_picture_url: string | null;
    created_at_metadata: PrayerTimeMetadata | null;
    updated_at_metadata: PrayerTimeMetadata | null;
    answered_at_metadata: PrayerTimeMetadata | null;
}

export interface AdminPrayerPage {
    items: AdminPrayer[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface FetchAdminPrayersParams {
    churchId?: number;
    cursor?: string | null;
    limit?: number;
}
