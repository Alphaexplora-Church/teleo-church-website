import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboardModel } from '../model/adminDashboard.model';
import type { DashboardData } from '../model/adminDashboard.types';

export function useAdminDashboardViewModel() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [userName] = useState(() => AdminDashboardModel.getUserName());

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        let active = true;
        AdminDashboardModel.load()
            .then(result => { if (active) setData(result); })
            .catch(() => { if (active) setError('Could not load dashboard data. Make sure the backend is running.'); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [navigate, reloadKey]);

    const retry = () => {
        setError(null);
        setIsLoading(true);
        setReloadKey(current => current + 1);
    };

    return {
        userName,
        data,
        isLoading,
        error,
        retry,
        goToContent: () => navigate('/admin/events'),
        goToRegistrations: () => navigate('/admin/registrations'),
        goToUsers: () => navigate('/admin/users'),
    };
}
