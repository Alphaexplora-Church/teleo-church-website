import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '../../../Auth/login/model/login.model';
import { AdminSettingsModel } from '../model/adminSettings.model';

export function useAdminSettingsViewModel() {
    const navigate = useNavigate();
    const [user] = useState<AuthUser>(() => AdminSettingsModel.getStoredUser());

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    const logout = () => {
        AdminSettingsModel.clearSession();
        navigate('/login');
    };

    return {
        user,
        userName: user.username || 'Admin',
        roles: user.roles?.length ? user.roles : ['Not assigned'],
        logout,
    };
}
