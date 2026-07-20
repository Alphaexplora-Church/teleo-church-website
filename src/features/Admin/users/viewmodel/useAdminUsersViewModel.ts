import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUsersModel } from '../model/adminUsers.model';
import type { ManagedUser, UserUpdateForm } from '../model/adminUsers.types';

export function useAdminUsersViewModel() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<ManagedUser[]>(() => AdminUsersModel.getUsers());
    const [updateTarget, setUpdateTarget] = useState<ManagedUser | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    const updateUser = (form: UserUpdateForm) => {
        if (!updateTarget) return;
        setUsers(AdminUsersModel.updateUser(updateTarget.id, form));
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
