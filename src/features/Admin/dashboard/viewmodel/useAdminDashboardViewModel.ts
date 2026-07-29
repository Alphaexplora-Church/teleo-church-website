import { useEffect, useState } from 'react';
import { AdminDashboardModel } from '../model/adminDashboard.model';
import type { DashboardData } from '../model/adminDashboard.types';
import { useNavigate } from 'react-router-dom';

export function useAdminDashboardViewModel() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        AdminDashboardModel.load()
            .then(result => { if (active) setData(result); })
            .catch(() => { if (active) setError('Could not load dashboard data. Make sure the backend is running.'); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [reloadKey]);

    const retry = () => {
        setError(null);
        setIsLoading(true);
        setReloadKey(current => current + 1);
    };

    return {
        data,
        isLoading,
        error,
        retry,
        goToContent: () => navigate('/admin/events'),
        goToRegistrations: () => navigate('/admin/registrations'),
        goToUsers: () => navigate('/admin/users'),
    };
}
