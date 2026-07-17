import { AdminEventsService } from '../../events/model/adminEvents.service';
import { AdminRegistrationsService } from '../../registrations/model/adminRegistrations.service';
import type { DashboardData, DashboardRegistration } from './adminDashboard.types';

const isThisMonth = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

export const AdminDashboardModel = {
    getUserName: () => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}') as { username?: string };
            return user.username || 'Admin';
        } catch {
            return 'Admin';
        }
    },

    load: async (): Promise<DashboardData> => {
        const [statsResult, eventsResult, announcementsResult, visitsResult, encounterResult, discipleshipResult] = await Promise.allSettled([
            AdminEventsService.fetchStats(),
            AdminEventsService.fetchEvents(1, 5),
            AdminEventsService.fetchAnnouncements(1, 5),
            AdminRegistrationsService.fetchAll(1, 1000),
            AdminRegistrationsService.fetchAllEncounter(1, 1000),
            AdminRegistrationsService.fetchAllDiscipleship(1, 1000),
        ]);

        const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
        const events = eventsResult.status === 'fulfilled' ? eventsResult.value.items : [];
        const announcements = announcementsResult.status === 'fulfilled' ? announcementsResult.value.items : [];
        const visits = visitsResult.status === 'fulfilled' ? visitsResult.value.items : [];
        const encounters = encounterResult.status === 'fulfilled' ? encounterResult.value.items : [];
        const discipleship = discipleshipResult.status === 'fulfilled' ? discipleshipResult.value.items : [];

        const registrationRows: DashboardRegistration[] = [
            ...visits.map(item => ({ id: `visit-${item.id}`, name: [item.first_name, item.last_name].filter(Boolean).join(' ') || 'Unnamed visitor', email: item.email || 'No email', type: 'Plan a Visit' as const, submittedAt: item.submitted_at })),
            ...encounters.map(item => ({ id: `encounter-${item.id}`, name: [item.first_name, item.last_name].filter(Boolean).join(' ') || 'Unnamed participant', email: item.email || 'No email', type: 'Encounter' as const, submittedAt: item.submitted_at })),
            ...discipleship.map(item => ({ id: `discipleship-${item.id}`, name: item.name || 'Unnamed contact', email: item.email || 'No email', type: 'Discipleship' as const, submittedAt: item.submitted_at })),
        ];

        return {
            kpis: {
                upcomingMonth: stats?.events.upcomingMonth ?? events.filter(item => item.status === 'active').length,
                thisWeek: stats?.events.thisWeek ?? 0,
                activeAnnouncements: stats?.announcements.activeLive ?? announcements.filter(item => item.status === 'active').length,
                newRegistrations: registrationRows.filter(item => isThisMonth(item.submittedAt)).length,
            },
            upcomingEvents: events.filter(item => item.status !== 'completed').slice(0, 5),
            latestAnnouncements: announcements.filter(item => item.status !== 'archived').slice(0, 4),
            recentRegistrations: registrationRows
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 5),
            visitors: {
                total: visits.length,
                firstTime: visits.filter(item => item.visitor_status === 'first_time').length,
                returning: visits.filter(item => item.visitor_status === 'returning').length,
            },
        };
    },
};
