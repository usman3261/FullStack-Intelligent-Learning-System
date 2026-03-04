import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    BrainCircuit, 
    GraduationCap, 
    Settings, 
    LogOut, 
    Menu, 
    X,
    User
} from 'lucide-react';

const AppLayout = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Documents', path: '/documents', icon: FileText },
        { name: 'Flashcards', path: '/flashcards', icon: BrainCircuit },
        { name: 'Quizzes', path: '/quizzes', icon: GraduationCap },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 p-2 rounded-lg">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">SmartLearn</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-emerald-600' : 'group-hover:text-slate-900'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Navbar */}
                <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 z-10">
                    <button 
                        className="lg:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 lg:flex-none">
                        {/* Title or Search could go here */}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.username || 'User'}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Student'}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                            {user?.username?.charAt(0).toUpperCase() || <User size={20} />}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
                        <div className="p-6 flex items-center justify-between border-b border-slate-100">
                            <span className="font-bold text-emerald-600">SmartLearn</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                        </div>
                        <nav className="p-4 flex-1 space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl"
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AppLayout;