// ─── Admin Registrations: Types (Model) ───────────────────────────────────────

export interface Registration {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    service_type: string | null;
    adult_count: number | null;
    child_count: number | null;
    visitor_status: 'first_time' | 'returning' | null;
    submitted_at: string;
}
