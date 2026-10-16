// ─── Admin Events: Types (Model) ────────────────────────────────────────────

export type ContentTab = 'event' | 'announcement';
export type ContentStatusFilter = 'all' | 'active' | 'completed' | 'archived';
export type ContentSort = 'date-asc' | 'date-desc' | 'newest' | 'title';

/** The create / edit form. For an announcement, description holds its content. */
export interface EventFormData {
    title: string;
    description: string;
    location: string;
    start_date_date: string;
    start_date_time: string;
    end_date_date: string;
    end_date_time: string;
    image?: File | null;
}

export const EMPTY_FORM: EventFormData = {
    title: '',
    description: '',
    location: '',
    start_date_date: '',
    start_date_time: '',
    end_date_date: '',
    end_date_time: '',
    image: null,
};
