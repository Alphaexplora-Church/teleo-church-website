import type { AuthUser } from '../../../Auth/login/model/login.model';

const readStoredUser = (): AuthUser => {
    try {
        const value = localStorage.getItem('adminUser');
        return value ? JSON.parse(value) as AuthUser : { email: '' };
    } catch {
        return { email: '' };
    }
};

export const AdminSettingsModel = {
    getStoredUser: readStoredUser,
    clearSession: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
    },
};
