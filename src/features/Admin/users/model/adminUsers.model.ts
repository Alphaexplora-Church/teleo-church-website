import type { AuthUser } from '../../../Auth/login/model/login.model';
import type { ManagedUser, UserUpdateForm } from './adminUsers.types';

const STORAGE_KEY = 'adminManagedUsers';

const readCurrentAdmin = (): AuthUser => {
    try {
        const value = localStorage.getItem('adminUser');
        return value ? JSON.parse(value) as AuthUser : { email: '' };
    } catch {
        return { email: '' };
    }
};

export const AdminUsersModel = {
    getUsers: (): ManagedUser[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved) as ManagedUser[];
        } catch {
            // Fall back to the authenticated account when saved preview data is invalid.
        }

        const admin = readCurrentAdmin();
        return [{
            id: admin.uid || 'current-admin',
            username: admin.username || 'Admin',
            email: admin.email || 'Not provided',
            // Keeps older login data compatible with the backend role name.
            role: admin.roles?.[0]?.toLowerCase() === 'admin' ? 'Church Admin' : admin.roles?.[0] || 'Church Admin',
        }];
    },

    updateUser: (id: string, form: UserUpdateForm): ManagedUser[] => {
        const users = AdminUsersModel.getUsers().map(user => user.id === id ? { ...user, ...form } : user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

        const currentAdmin = readCurrentAdmin();
        if ((currentAdmin.uid || 'current-admin') === id) {
            localStorage.setItem('adminUser', JSON.stringify({
                ...currentAdmin,
                username: form.username,
                email: form.email,
                roles: [form.role],
            }));
        }
        return users;
    },
};
