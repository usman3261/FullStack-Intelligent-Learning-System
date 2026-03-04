import React, { useEffect, useState } from 'react';
import documentService from '../../services/documentService';
import { FileText, Trash2, Eye, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocs = async () => {
        try {
            const res = await documentService.getDocuments();
            setDocuments(res.data || []);
        } catch (err) {
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await documentService.deleteDocument(id);
            toast.success("Document removed");
            setDocuments(prev => prev.filter(doc => doc._id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Library</h1>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Upload New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map(doc => (
                    <div key={doc._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <FileText size={24} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${doc.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.status}
                            </span>
                        </div>
                        <h3 className="mt-4 font-bold text-slate-800 truncate">{doc.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                        
                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                                <Eye size={16} /> View
                            </button>
                            <button onClick={() => handleDelete(doc._id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentsPage;