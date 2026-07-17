export interface FormattedDate {
    date: string;
    time: string;
    day?: string;
}

export interface ContentMedia {
    id?: number;
    file_url: string;
    media_type?: string;
}

interface BaseContent {
    id: number;
    title: string;
    description?: string | null;
    category_content?: string | null;
    status?: 'active' | 'completed' | 'archived' | string | null;
    start_date?: FormattedDate | null;
    media?: ContentMedia[];
    author?: { username?: string | null } | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface ChurchEvent extends BaseContent {
    location?: string | null;
    end_date?: FormattedDate | null;
}

export interface Announcement extends BaseContent {
    end_date?: FormattedDate | null;
}

export type ContentItem = ChurchEvent | Announcement;

export interface AdminContentStats {
    events: {
        upcomingMonth: number;
        thisWeek: number;
        completedMonth: number;
    };
    announcements: {
        activeLive: number;
        postedThisMonth: number;
        activeCategories: number;
    };
}
