// Events and announcements as the API returns them, following the
// events_announcements schema: separate events and announcements with UUID
// ids, media rows with a url, and no category.

export interface FormattedDate {
    date: string;
    time: string;
    day?: string;
}

export interface ContentMedia {
    id?: string;
    url: string;
    media_type?: string;
    sort_order?: number;
}

interface BaseContent {
    id: string;
    title: string;
    media?: ContentMedia[];
    author?: { username?: string | null } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface ChurchEvent extends BaseContent {
    description?: string | null;
    location?: string | null;
    start_date?: FormattedDate | null;
    end_date?: FormattedDate | null;
    is_paid?: boolean;
    fee_amount?: number | string;
    currency?: string;
    payment_instructions?: string | null;
    capacity_limit?: number | null;
    is_full?: boolean;
    /** Deleting an event cancels it. */
    status?: 'active' | 'completed' | 'cancelled' | string | null;
}

export interface Announcement extends BaseContent {
    content: string;
    /** Deleting an announcement archives it. */
    status?: 'active' | 'archived' | 'cancelled' | string | null;
}

export type ContentItem = ChurchEvent | Announcement;

export const isChurchEvent = (item: ContentItem): item is ChurchEvent => !('content' in item);

export interface AdminContentStats {
    events: {
        upcomingMonth: number;
        thisWeek: number;
        completedMonth: number;
    };
    announcements: {
        activeLive: number;
        postedThisMonth: number;
    };
}
