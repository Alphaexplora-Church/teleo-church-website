import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    userName?: string;
}

export default function AdminHeader({ userName = 'Admin' }: AdminHeaderProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    return (
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-midnight-teal/10 bg-white/25 px-6 py-6 backdrop-blur-md lg:px-10">
            <span className="font-serif text-2xl text-midnight-teal sm:text-3xl">Welcome, {userName}</span>
            <button onClick={handleLogout} className="rounded-xl border border-midnight-teal/10 bg-white/50 px-4 py-2 text-sm font-bold text-harvest-orange shadow-sm backdrop-blur-xl transition-colors hover:bg-white/80">
                Logout
            </button>
        </header>
    );
}
