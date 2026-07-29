import type { AuthUser } from '../../../Auth/login/model/login.model';
import type { ManagedUser, UserUpdateForm } from './adminUsers.types';

const STORAGE_KEY = 'adminManagedUsers';

export const AdminUsersModel = {
    getUsers: (currentAdmin: AuthUser | null): ManagedUser[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved) as ManagedUser[];
        } catch {
            // Fall back to the authenticated account when saved preview data is invalid.
        }

        return [{
            id: currentAdmin?.uid || 'current-admin',
            username: currentAdmin?.username || 'Admin',
            email: currentAdmin?.email || 'Not provided',
            // Keeps older login data compatible with the backend role name.
            role: currentAdmin?.roles?.[0]?.toLowerCase() === 'admin' ? 'Church Admin' : currentAdmin?.roles?.[0] || 'Church Admin',
        }];
    },

    updateUser: (id: string, form: UserUpdateForm, currentAdmin: AuthUser | null): ManagedUser[] => {
        const users = AdminUsersModel.getUsers(currentAdmin).map(user => user.id === id ? { ...user, ...form } : user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users;
    },
};
