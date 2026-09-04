export type PrayerAudience = 'PUBLIC' | 'PRIVATE' | 'HOME_CHURCH' | 'CHURCH_MINISTRY' | 'CHURCH_INTERCESSION';

export type IntercessionStatus = 'ALL' | 'NOT_PRAYED_YET' | 'PRAYED';

export interface PrayerTimeMetadata {
    date: string;
    time: string;
    day: string;
    relative_time: string;
}

export interface AdminPrayerComment {
    id: string;
    prayer_id: string;
    user_id: number | string;
    content: string;
    created_at: string;
    updated_at: string;
    author_name?: string | null;
    author_profile_picture_url?: string | null;
    created_at_metadata?: PrayerTimeMetadata | null;
    updated_at_metadata?: PrayerTimeMetadata | null;
}

export interface AdminPrayer {
    id: string;
    prayer_id?: string;
    user_id: string | null;
    home_church_id: number | null;
    title: string;
    audience: PrayerAudience;
    description: string;
    prayer_tag: string | null;
    is_urgent?: boolean;
    is_anonymous?: boolean;
    is_answered: boolean;
    answer_note: string | null;
    answered_at: string | null;
    created_at: string;
    updated_at?: string;
    reactions_count?: number;
    times_prayed_by_team?: number;
    first_prayed_at?: string | null;
    team_status?: 'PRAYED' | 'NOT_PRAYED_YET';
    is_prayed_by_church?: boolean;
    times_prayed_by_church?: number;
    author_name: string | null;
    author_profile_picture_url: string | null;
    created_at_metadata: PrayerTimeMetadata | null;
    updated_at_metadata?: PrayerTimeMetadata | null;
    answered_at_metadata?: PrayerTimeMetadata | null;
    comments?: AdminPrayerComment[];
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

export interface FetchIntercessionParams extends FetchAdminPrayersParams {
    status?: IntercessionStatus;
}
