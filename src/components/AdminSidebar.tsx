import { Link } from 'react-router-dom';

interface AdminSidebarProps {
    className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
    return (
        <aside className={`w-64 bg-midnight-teal text-soft-linen flex flex-col ${className}`}>
            <div className="p-6 font-serif text-2xl text-center border-b border-soft-linen/20">
                WLCM Admin
            </div>
            <nav className="flex-1 p-6 space-y-4">
                <Link to="/admin/dashboard" className="block hover:text-harvest-orange">
                    Home
                </Link>
                <Link to="/admin/events" className="block hover:text-harvest-orange">
                    Content
                </Link>
                <Link to="/admin/registrations" className="block hover:text-harvest-orange">
                    Registrations
                </Link>
                <Link to="/admin/settings" className="block hover:text-harvest-orange">
                    Settings
                </Link>
            </nav>
        </aside>
    );
}
