import React, { useState } from 'react';
import documentService from '../../services/documentService';
import { Upload, Loader2, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title) return toast.error("Please provide a title and a file");

        const formData = new FormData();
        formData.append('file', file); // 'file' must match your backend Multer config
        formData.append('title', title);

        setIsUploading(true);
        try {
            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully! AI is processing...");
            setFile(null);
            setTitle('');
            if (onUploadSuccess) onUploadSuccess(); // This triggers a dashboard refresh
        } catch (error) {
            toast.error(error.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-xl border border-slate-200">
            <input 
                type="text" 
                placeholder="Enter Document Title"
                className="w-full p-2 border rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div className="border-2 border-dashed p-10 text-center rounded-lg relative">
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.txt,.doc,.docx"
                />
                {file ? <FileCheck className="mx-auto text-emerald-500" /> : <Upload className="mx-auto" />}
                <p className="mt-2">{file ? file.name : "Click to select a file"}</p>
            </div>
            <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg flex justify-center"
            >
                {isUploading ? <Loader2 className="animate-spin" /> : "Upload & Analyze"}
            </button>
        </form>
    );
};