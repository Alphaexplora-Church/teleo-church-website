// ─── Admin Discipleship (Contact) Registrations: Types ────────────────────────

export interface DiscipleshipRegistration {
    id: number;
    name: string | null;
    email: string | null;
    message: string | null;
    submitted_at: string;
}
