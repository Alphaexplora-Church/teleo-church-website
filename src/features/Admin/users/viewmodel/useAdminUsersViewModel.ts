import { useState } from 'react';
import { useAuth } from '../../../../shared/context/useAuth';
import { AdminUsersModel } from '../model/adminUsers.model';
import type { ManagedUser, UserUpdateForm } from '../model/adminUsers.types';

export function useAdminUsersViewModel() {
    const { user } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>(() => AdminUsersModel.getUsers(user));
    const [updateTarget, setUpdateTarget] = useState<ManagedUser | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const updateUser = (form: UserUpdateForm) => {
        if (!updateTarget) return;
        setUsers(AdminUsersModel.updateUser(updateTarget.id, form, user));
        setUpdateTarget(null);
        setToast('User account updated.');
        window.setTimeout(() => setToast(null), 3000);
    };

    return {
        users,
        updateTarget,
        toast,
        openUpdate: setUpdateTarget,
        closeUpdate: () => setUpdateTarget(null),
        updateUser,
    };
}
