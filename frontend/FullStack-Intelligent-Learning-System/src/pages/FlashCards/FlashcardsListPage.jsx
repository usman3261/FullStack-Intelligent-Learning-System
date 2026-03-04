import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { BrainCircuit, BookOpen, Trash2, Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
                setFlashcardSets(res.data.data || []);
            } catch (err) {
                toast.error("Failed to load flashcard sets");
            } finally {
                setLoading(false);
            }
        };
        fetchSets();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this study set?")) return;
        try {
            await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id));
            setFlashcardSets(prev => prev.filter(set => set._id !== id));
            toast.success("Set deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <BrainCircuit className="text-emerald-600" /> My Study Sets
            </h1>

            {flashcardSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flashcardSets.map(set => (
                        <div key={set._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="font-bold text-slate-800 truncate">{set.documentId?.title || "Document Set"}</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">{set.cards?.length || 0} Flashcards generated</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigate(`/documents/${set.documentId?._id}/flashcards`)}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                                >
                                    <Play size={14} /> Start Study
                                </button>
                                <button 
                                    onClick={() => handleDelete(set._id)}
                                    className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No flashcards found. Go to a document to generate some!</p>
                </div>
            )}
        </div>
    );
};

export default FlashcardsListPage;