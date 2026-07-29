import { NavLink } from 'react-router-dom';
import teleoLogo from '../../assets/teleo-logo.png';
import { useAdminSidebarViewModel } from '../viewModels/useAdminSidebarViewModel';

interface AdminSidebarProps {
    className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
    const vm = useAdminSidebarViewModel();

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            isActive
                ? 'bg-midnight-teal text-soft-linen shadow-lg shadow-midnight-teal/15'
                : 'text-midnight-teal/65 hover:bg-white/60 hover:text-midnight-teal'
        }`;

    return (
        <aside className={`admin-nav relative z-40 flex w-full shrink-0 flex-col border-b border-midnight-teal/10 bg-white/80 px-5 backdrop-blur-2xl lg:h-full lg:self-stretch lg:w-64 lg:border-b-0 lg:border-r lg:px-6 ${className}`}>
            <div className="border-b border-midnight-teal/10 py-6 flex items-center gap-3">
                <img
                    src={teleoLogo}
                    alt="Teleo"
                    className="h-9 w-9 object-contain"
                />
                <span className="font-sans text-xl font-black tracking-widest text-midnight-teal">
                    TELEO
                </span>
            </div>
            <nav className="flex gap-1 overflow-x-auto py-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:py-8">
                {/* Dashboard — always visible */}
                <NavLink to="/admin/dashboard" className={navClass}>
                    Home
                </NavLink>

                {vm.showContentManagement && (
                    <NavLink to="/admin/events" className={navClass}>
                        Content
                    </NavLink>
                )}

                {vm.showEventsAnnouncement && (
                    <NavLink to="/admin/announcements" className={navClass}>
                        Events & Announcements
                    </NavLink>
                )}

                {vm.showServices && (
                    <NavLink to="/admin/services" className={navClass}>
                        Services
                    </NavLink>
                )}

                {vm.showCommunity && (
                    <NavLink to="/admin/community" className={navClass}>
                        Community
                    </NavLink>
                )}

                {vm.showGiving && (
                    <NavLink to="/admin/giving" className={navClass}>
                        Giving
                    </NavLink>
                )}

                {vm.showRegistrations && (
                    <NavLink to="/admin/registrations" className={navClass}>
                        Registrations
                    </NavLink>
                )}

                {vm.showPrayerWall && (
                    <NavLink to="/admin/prayer-wall" className={navClass}>
                        Prayer Wall
                    </NavLink>
                )}

                {/* Settings & Users — always visible */}
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

