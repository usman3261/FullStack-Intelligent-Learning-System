import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import AIChatSidebar from '../../components/documents/AIChatSidebar';
import { 
    FileText, BrainCircuit, GraduationCap, 
    Sparkles, MessageSquare, ArrowLeft, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentsDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Sync helper: Check if document is fully ready for AI tools
    const isReady = doc?.status === 'processed';
    const hasFailed = doc?.status === 'error';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await documentService.getDocumentById(id);
                setDoc(res.data);
            } catch (err) {
                toast.error("Could not find document");
                navigate('/documents');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const handleAIGenerate = async (type) => {
        if (!isReady) {
            return toast.error("Document is still being analyzed. Please wait.");
        }

        setIsGenerating(true);
        const loadingToast = toast.loading(`AI is generating your ${type}...`);
        
        try {
            const endpoint = type === 'flashcards' 
                ? API_PATHS.AI.GENERATE_FLASHCARDS 
                : API_PATHS.AI.GENERATE_QUIZ;

            const res = await axiosInstance.post(endpoint, { documentId: id });
            
            if (res.data.success) {
                toast.success(`${type} generated successfully!`, { id: loadingToast });
                
                // Refresh data to show updated card/quiz counts
                const updated = await documentService.getDocumentById(id);
                setDoc(updated.data);
            }
        } catch (err) {
            toast.error(`Failed to generate ${type}. Try a shorter document.`, { id: loadingToast });
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    return (
        <div className="flex h-full bg-slate-50 relative overflow-hidden">
            {/* Main Content Area */}
            <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'lg:mr-96' : ''}`}>
                <div className="p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <button 
                        onClick={() => navigate('/documents')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium"
                    >
                        <ArrowLeft size={18} /> Back to Library
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl ${hasFailed ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">{doc.title}</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                isReady ? 'bg-emerald-100 text-emerald-600' : 
                                                hasFailed ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {doc.status}
                                            </span>
                                            {!isReady && !hasFailed && <Loader2 size={12} className="animate-spin text-amber-600" />}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Sparkles className="text-amber-500" size={18} /> AI Executive Summary
                                </h3>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    {hasFailed ? (
                                        <div className="flex items-center gap-2 text-rose-500 font-medium">
                                            <AlertCircle size={18} /> PDF text extraction failed. Please try re-uploading.
                                        </div>
                                    ) : (
                                        doc.summary || "Summary will appear here once analysis is complete."
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Tools */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <BrainCircuit className="text-emerald-400" size={20} /> AI Study Tools
                                </h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleAIGenerate('flashcards')}
                                        disabled={isGenerating || !isReady}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3 text-sm font-semibold">
                                            <BrainCircuit size={18} /> Generate Flashcards
                                        </div>
                                        <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {doc.flashcardCount || 0}
                                        </span>
                                    </button>

                                    <button 
                                        onClick={() => handleAIGenerate('quiz')}
                                        disabled={isGenerating || !isReady}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3 text-sm font-semibold">
                                            <GraduationCap size={18} /> Generate Quiz
                                        </div>
                                        <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {doc.quizCount || 0}
                                        </span>
                                    </button>

                                    <button 
                                        onClick={() => setIsChatOpen(true)}
                                        disabled={!isReady}
                                        className="w-full flex items-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all font-bold text-sm shadow-md shadow-emerald-900/20 disabled:opacity-30"
                                    >
                                        <MessageSquare size={18} /> Ask AI a Question
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Info</h4>
                                <ul className="space-y-4 text-sm">
                                    <li className="flex justify-between">
                                        <span className="text-slate-500">File</span>
                                        <span className="font-medium text-slate-900 truncate ml-4 max-w-[120px]">{doc.fileName}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-500">Analysis</span>
                                        {isReady ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Loader2 size={16} className="animate-spin text-amber-500" />}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chat Drawer */}
            {isChatOpen && (
                <div className="fixed inset-y-0 right-0 z-50 w-full lg:w-96 shadow-2xl animate-in slide-in-from-right duration-300">
                    <AIChatSidebar 
                        documentId={id} 
                        onClose={() => setIsChatOpen(false)} 
                    />
                </div>
            )}
        </div>
    );
};

export default DocumentsDetailPage;