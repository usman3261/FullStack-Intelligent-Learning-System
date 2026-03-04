import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance"; 
import ProgressChart from "../../components/dashboard/ProgressChart"; // Import the chart component
import { 
    FileText, BrainCircuit, TrendingUp, Clock, Loader2, Plus, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = { FileText, BrainCircuit, TrendingUp, Clock };

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: [],
        chartData: [],
        documents: [],
        quizzes: []
    });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axiosInstance.get('/api/progress/dashboard');
                if (res.data.success) {
                    const { overview, recentActivity } = res.data.data;
                    
                    const mappedStats = [
                        { label: "Total Documents", value: overview.totalDocuments, icon: 'FileText' },
                        { label: "Flashcards", value: overview.totalFlashcards, icon: 'BrainCircuit' },
                        { label: "Avg. Quiz Score", value: `${overview.averageScore}%`, icon: 'TrendingUp' },
                        { label: "Study Streak", value: `${overview.studyStreak} Days`, icon: 'Clock' }
                    ];

                    setData({
                        stats: mappedStats,
                        chartData: overview.chartData, // Store the array for Recharts
                        documents: recentActivity.documents,
                        quizzes: recentActivity.quizzes
                    });
                }
            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.username || "Scholar"}! 👋
                    </h1>
                    <p className="text-slate-500 text-sm">You're on a {data.stats[3]?.value} streak. Keep it up!</p>
                </div>
                <button 
                    onClick={() => navigate('/documents')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    <Plus size={18} /> New Analysis
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {data.stats.map((stat, i) => {
                    const Icon = ICON_MAP[stat.icon] || FileText;
                    return (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Visual Row: Chart and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="font-bold text-slate-800">Learning Curve</h2>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Performance History</span>
                    </div>
                    {/* The Chart Component */}
                    <div className="h-[300px]">
                        {data.chartData.length > 0 ? (
                            <ProgressChart data={data.chartData} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
                                <TrendingUp size={40} className="mb-2 opacity-20" />
                                <p className="text-sm">Complete a quiz to see your progress!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl shadow-emerald-100 text-white relative overflow-hidden group">
                    <BrainCircuit className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-xl font-bold mb-2">Smart Study</h3>
                    <p className="text-emerald-50 text-sm mb-8 leading-relaxed">
                        Our AI has detected 3 concepts you haven't reviewed lately in your recent documents.
                    </p>
                    <button 
                        onClick={() => navigate('/flashcards')}
                        className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors"
                    >
                        Review Now <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Recent Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Documents</h3>
                        <button onClick={() => navigate('/documents')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Accessed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.documents.map(doc => (
                                    <tr key={doc._id} onClick={() => navigate(`/documents/${doc._id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-700 text-sm">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${doc.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-400">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-6">Latest Quizzes</h3>
                    <div className="space-y-4">
                        {data.quizzes.map(quiz => (
                            <div key={quiz._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer">
                                <p className="font-bold text-slate-800 text-sm">{quiz.documentId?.title || 'General Quiz'}</p>
                                <div className="flex justify-between mt-3 items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                                        <span className="text-emerald-600 font-black text-lg">{quiz.score} / {quiz.totalQuestions}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                        {new Date(quiz.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;