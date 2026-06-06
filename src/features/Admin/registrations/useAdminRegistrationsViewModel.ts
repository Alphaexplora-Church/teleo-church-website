// ─── Admin Registrations: ViewModel ───────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Registration } from './adminRegistrations.types';
import type { EncounterRegistration } from './adminEncounterRegistrations.types';
import type { DiscipleshipRegistration } from './adminDiscipleshipRegistrations.types';
import { AdminRegistrationsService } from './adminRegistrations.service';

export type RegistrationTab = 'plan-a-visit' | 'encounter' | 'discipleship';

export interface AdminRegistrationsViewModel {
    // Tab
    activeTab: RegistrationTab;
    setActiveTab: (tab: RegistrationTab) => void;

    // Data
    registrations: Registration[];
    encounterRegistrations: EncounterRegistration[];
    discipleshipRegistrations: DiscipleshipRegistration[];

    // Filtered
    filteredRegistrations: Registration[];
    filteredEncounterRegistrations: EncounterRegistration[];
    filteredDiscipleshipRegistrations: DiscipleshipRegistration[];

    // State
    isLoading: boolean;
    error: string | null;
    search: string;
    setSearch: (s: string) => void;

    // Pagination
    page: number;
    setPage: (p: number) => void;
    totalPages: number;
    paginatedRegistrations: Registration[];
    paginatedEncounterRegistrations: EncounterRegistration[];
    paginatedDiscipleshipRegistrations: DiscipleshipRegistration[];

    // Stats (for active tab)
    stats: {
        total: number;
        statA: number;
        statALabel: string;
        statB: number;
        statBLabel: string;
    };

    retry: () => void;
}

export function useAdminRegistrationsViewModel(): AdminRegistrationsViewModel {
    const navigate = useNavigate();

    const [activeTab, setActiveTabState] = useState<RegistrationTab>('plan-a-visit');
    const [search, setSearchState] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [encounterRegistrations, setEncounterRegistrations] = useState<EncounterRegistration[]>([]);
    const [discipleshipRegistrations, setDiscipleshipRegistrations] = useState<DiscipleshipRegistration[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAll = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [pav, enc, dis] = await Promise.allSettled([
                AdminRegistrationsService.fetchAll(1, 1000), // Fetch up to 1000 to keep client-side stats working
                AdminRegistrationsService.fetchAllEncounter(1, 1000),
                AdminRegistrationsService.fetchAllDiscipleship(1, 1000),
            ]);
            if (pav.status === 'fulfilled') setRegistrations(pav.value.items);
            if (enc.status === 'fulfilled') setEncounterRegistrations(enc.value.items);
            if (dis.status === 'fulfilled') setDiscipleshipRegistrations(dis.value.items);

            // If ALL failed, surface an error
            if (pav.status === 'rejected' && enc.status === 'rejected' && dis.status === 'rejected') {
                setError('Could not load registrations. Make sure the backend is running.');
            }
        } catch {
            setError('Could not load registrations. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        } else {
            loadAll();
        }
    }, [navigate]);

    // Reset search and page when switching tabs
    const setActiveTab = (tab: RegistrationTab) => {
        setActiveTabState(tab);
        setSearchState('');
        setPage(1);
    };

    const setSearch = (s: string) => {
        setSearchState(s);
        setPage(1);
    };

    // ── Filtered lists ─────────────────────────────────────────────────────────
    const q = search.toLowerCase();

    const filteredRegistrations = registrations.filter(r =>
        (r.first_name || '').toLowerCase().includes(q) ||
        (r.last_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
    );

    const filteredEncounterRegistrations = encounterRegistrations.filter(r =>
        (r.first_name || '').toLowerCase().includes(q) ||
        (r.last_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
    );

    const filteredDiscipleshipRegistrations = discipleshipRegistrations.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
    );

    // ── Pagination ─────────────────────────────────────────────────────────────
    const paginatedRegistrations = filteredRegistrations.slice((page - 1) * limit, page * limit);
    const paginatedEncounterRegistrations = filteredEncounterRegistrations.slice((page - 1) * limit, page * limit);
    const paginatedDiscipleshipRegistrations = filteredDiscipleshipRegistrations.slice((page - 1) * limit, page * limit);

    const totalPages = Math.ceil(
        (activeTab === 'plan-a-visit' ? filteredRegistrations.length :
            activeTab === 'encounter' ? filteredEncounterRegistrations.length :
                filteredDiscipleshipRegistrations.length) / limit
    ) || 1;

    // ── Stats (per active tab) ─────────────────────────────────────────────────
    const stats = (() => {
        if (activeTab === 'plan-a-visit') {
            return {
                total: registrations.length,
                statA: registrations.filter(r => r.visitor_status === 'first_time').length,
                statALabel: 'First-Time Guests',
                statB: registrations.filter(r => r.visitor_status === 'returning').length,
                statBLabel: 'Returning Guests',
            };
        }
        if (activeTab === 'encounter') {
            return {
                total: encounterRegistrations.length,
                statA: encounterRegistrations.length,
                statALabel: 'Total Sign-ups',
                statB: 0,
                statBLabel: '',
            };
        }
        // discipleship
        return {
            total: discipleshipRegistrations.length,
            statA: 0,
            statALabel: '',
            statB: 0,
            statBLabel: '',
        };
    })();

    return {
        activeTab,
        setActiveTab,
        registrations,
        encounterRegistrations,
        discipleshipRegistrations,
        filteredRegistrations,
        filteredEncounterRegistrations,
        filteredDiscipleshipRegistrations,
        isLoading,
        error,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        paginatedRegistrations,
        paginatedEncounterRegistrations,
        paginatedDiscipleshipRegistrations,
        stats,
        retry: loadAll,
    };
}
