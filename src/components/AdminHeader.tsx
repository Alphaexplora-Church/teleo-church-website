import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    userName?: string;
}

export default function AdminHeader({ userName = 'Admin' }: AdminHeaderProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between bg-soft-linen px-6 py-4 shadow">
            <span className="text-xl font-sans text-midnight-teal">Welcome, {userName}</span>
            <button onClick={handleLogout} className="text-harvest-orange font-bold">
                Logout
            </button>
        </header>
    );
}
