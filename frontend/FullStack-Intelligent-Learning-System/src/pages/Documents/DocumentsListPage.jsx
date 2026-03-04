import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';
import { 
    FileText, Plus, Search, Trash2, 
    Clock, ExternalLink, Loader2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentsListPage = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');

    const fetchDocuments = async () => {
        try {
            const res = await documentService.getDocuments();
            setDocuments(res.data || []);
        } catch (err) {
            toast.error("Failed to load your library");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error("Please select a PDF file");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || file.name);

        setUploading(true);
        const loadingToast = toast.loading("Uploading and parsing PDF...");

        try {
            await documentService.uploadDocument(formData);
            toast.success("Upload successful! AI is processing.", { id: loadingToast });
            setIsModalOpen(false);
            setFile(null);
            setTitle('');
            fetchDocuments(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed", { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent navigating to details
        if (!window.confirm("Are you sure? This will delete all associated quizzes and flashcards.")) return;

        try {
            await documentService.deleteDocument(id);
            setDocuments(prev => prev.filter(doc => doc._id !== id));
            toast.success("Document deleted");
        } catch (err) {
            toast.error("Failed to delete document");
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Library</h1>
                    <p className="text-slate-500 font-medium">Manage your study materials and AI-generated insights.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                    <Plus size={20} /> Upload New PDF
                </button>
            </div>

            {/* Document Grid */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <div 
                            key={doc._id}
                            onClick={() => navigate(`/documents/${doc._id}`)}
                            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(e, doc._id)}
                                    className="text-slate-300 hover:text-rose-600 p-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{doc.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-6">
                                <Clock size={14} />
                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex gap-3">
                                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        {doc.flashcardCount || 0} Cards
                                    </span>
                                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        {doc.quizCount || 0} Quizzes
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                    doc.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {doc.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Your library is empty</h3>
                    <p className="text-slate-500 mb-8">Upload a PDF to start generating AI study tools.</p>
                </div>
            )}

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Add Document</h2>
                            <p className="text-slate-500 text-sm mb-6">Upload your PDF notes or textbooks.</p>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Document Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Network Security Chapter 1"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-500 transition-all bg-slate-50">
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        className="hidden" 
                                        id="pdf-upload" 
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    <label htmlFor="pdf-upload" className="cursor-pointer">
                                        <div className="bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                                            <Plus className="text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-700">
                                            {file ? file.name : "Choose PDF file"}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Max size: 10MB</p>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={uploading || !file}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
                                    >
                                        {uploading ? "Uploading..." : "Start Analysis"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsListPage;