import { NavLink } from 'react-router-dom';

interface AdminSidebarProps {
    className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
    const navClass = ({ isActive }: { isActive: boolean }) =>
        `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            isActive
                ? 'bg-midnight-teal text-soft-linen shadow-lg shadow-midnight-teal/15'
                : 'text-midnight-teal/65 hover:bg-white/60 hover:text-midnight-teal'
        }`;

    return (
        <aside className={`admin-nav relative z-40 flex w-full shrink-0 flex-col border-b border-midnight-teal/10 bg-white/80 px-5 backdrop-blur-2xl lg:h-full lg:self-stretch lg:w-64 lg:border-b-0 lg:border-r lg:px-6 ${className}`}>
            <div className="border-b border-midnight-teal/10 py-6 font-serif text-2xl text-midnight-teal">
                words of life.
            </div>
            <nav className="flex gap-1 overflow-x-auto py-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:py-8">
                <NavLink to="/admin/dashboard" className={navClass}>
                    Home
                </NavLink>
                <NavLink to="/admin/events" className={navClass}>
                    Content
                </NavLink>
                <NavLink to="/admin/prayer-wall" className={navClass}>
                    Prayer Wall
                </NavLink>
                <NavLink to="/admin/users" className={navClass}>
                    User Account Management
                </NavLink>
                <NavLink to="/admin/settings" className={navClass}>
                    Settings
                </NavLink>
            </nav>
        </aside>
    );
}
