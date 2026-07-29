import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/useAuth';

export function useAdminSettingsViewModel() {
    const navigate = useNavigate();
    const { user, logout: authLogout } = useAuth();

    const logout = async () => {
        await authLogout();
        navigate('/login');
    };

    return {
        user: user ?? { email: '' },
        userName: user?.username || 'Admin',
        roles: user?.roles?.length ? user.roles : ['Not assigned'],
        logout,
    };
}
