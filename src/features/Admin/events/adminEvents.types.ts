// ─── Admin Events: Types (Model) ────────────────────────────────────────────

export type ContentTab = 'event' | 'announcement';

export interface EventFormData {
    title: string;
    description: string;
    location: string;
    category_content: string;
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
    category_content: '',
    start_date_date: '',
    start_date_time: '',
    end_date_date: '',
    end_date_time: '',
    image: null,
};
