export interface ManagedUser {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface UserUpdateForm {
    username: string;
    email: string;
    role: string;
}
