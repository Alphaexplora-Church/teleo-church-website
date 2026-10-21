import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/useAuth';
import type { AuthUser } from '../../../../shared/models/types/auth';

const DEFAULT_USER: AuthUser = {
  uid: '',
  email: '',
  username: null,
  profile_picture_url: null,
  roles: [],
  home_church_id: null,
  features_config: null,
};

export function useAdminSettingsViewModel() {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();

  const logout = async () => {
    await authLogout();
    navigate('/login');
  };

  return {
    user: user ?? DEFAULT_USER,
    userName: user?.username || 'Admin',
    roles: user?.roles?.length ? user.roles : ['Not assigned'],
    logout,
  };
}
