import type { Announcement, ChurchEvent } from '../../events/model/content.types';

export interface DashboardRegistration {
    id: string;
    name: string;
    email: string;
    type: 'Plan a Visit' | 'Encounter' | 'Discipleship';
    submittedAt: string;
}

export interface DashboardData {
    kpis: {
        upcomingMonth: number;
        thisWeek: number;
        activeAnnouncements: number;
        newRegistrations: number;
    };
    upcomingEvents: ChurchEvent[];
    latestAnnouncements: Announcement[];
    recentRegistrations: DashboardRegistration[];
    visitors: {
        total: number;
        firstTime: number;
        returning: number;
    };
}
