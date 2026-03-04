import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { User, Mail, Shield, Award, Calendar, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, login } = useAuth(); // login to update local state after profile change
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState(null);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await axiosInstance.get('/api/progress/dashboard');
                if (res.data.success) {
                    setStats(res.data.data.overview);
                }
            } catch (err) {
                console.error("Error loading profile stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await axiosInstance.put('/api/auth/profile', formData);
            if (res.data.success) {
                toast.success("Profile updated successfully!");
                // Update your context/localStorage with new data if needed
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Badge */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-md">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
                        <p className="text-slate-500 text-sm flex items-center justify-center gap-1 mt-1">
                            <Shield size={14} /> {user?.role || 'Student'}
                        </p>
                        
                        <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">{stats?.studyStreak || 0}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Day Streak</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{stats?.averageScore || 0}%</p>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg Score</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <Award className="absolute -right-4 -bottom-4 opacity-20 w-32 h-32" />
                        <h3 className="font-bold text-lg mb-2">Learning Milestone</h3>
                        <p className="text-emerald-100 text-sm">You have mastered {stats?.totalFlashcards || 0} concepts across {stats?.totalDocuments || 0} documents!</p>
                    </div>
                </div>

                {/* Right Column: Edit Profile */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Account Settings</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <User size={16} /> Username
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Mail size={16} /> Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        value={formData.email}
                                        disabled
                                    />
                                    <p className="text-[10px] text-slate-400">Email cannot be changed for security.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={updating}
                                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                        <Calendar className="text-blue-600 shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm">Learning Since</h4>
                            <p className="text-blue-700 text-sm">March 4, 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;