import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { GraduationCap, ClipboardCheck, Trash2, Loader2, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizzesListPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                // Adjust this path if your API_PATHS has a different name
                const res = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD); 
                // Alternatively, if you have a specific 'GET_ALL_QUIZZES' endpoint:
                // const res = await axiosInstance.get('/api/quizzes');
                setQuizzes(res.data.data.recentActivity.quizzes || []);
            } catch (err) {
                toast.error("Failed to load quizzes");
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this quiz?")) return;
        try {
            await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(id));
            setQuizzes(prev => prev.filter(q => q._id !== id));
            toast.success("Quiz removed");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <GraduationCap className="text-blue-600" /> My Quizzes
            </h1>

            {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ClipboardCheck size={20} />
                                </div>
                                {quiz.completedAt ? (
                                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Completed</span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded">Pending</span>
                                )}
                            </div>
                            
                            <h3 className="font-bold text-slate-800 truncate mb-1">{quiz.title || "Untitled Quiz"}</h3>
                            <p className="text-xs text-slate-500 mb-6">Based on: {quiz.documentId?.title || "Document"}</p>
                            
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                                    <p className="font-bold text-slate-900">{quiz.score ?? 0}/{quiz.totalQuestions}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Questions</p>
                                    <p className="font-bold text-slate-900">{quiz.totalQuestions}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => navigate(quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}/take`)}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                                >
                                    <PlayCircle size={16} /> {quiz.completedAt ? 'View Results' : 'Start Quiz'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(quiz._id)}
                                    className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No quizzes found. Go to a document to generate your first quiz!</p>
                </div>
            )}
        </div>
    );
};

export default QuizzesListPage;