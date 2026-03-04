import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Send, Bot, User, Loader2, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AIChatSidebar = ({ documentId, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I've analyzed this document. Ask me anything about it!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollBottomRef = useRef(null);

    // Auto-scroll logic: scroll into view of the dummy div at the bottom
    useEffect(() => {
        scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userQuery = input.trim();
        if (!userQuery || isLoading) return;

        // Optimistic update
        const userMessage = { role: 'user', content: userQuery };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
                documentId,
                question: userQuery // SYNCED: backend controller expects 'question'
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: response.data.data.answer 
                }]);
            }
        } catch (error) {
            toast.error("AI is currently unavailable. Try again shortly.");
            console.error("Chat Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-emerald-400" size={18} />
                    <span className="font-bold text-sm tracking-tight">Document AI Assistant</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}>
                                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm animate-pulse">
                            <Loader2 size={16} className="animate-spin text-emerald-600" />
                            <span className="text-xs text-slate-500 font-medium">AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollBottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        placeholder="Ask a question..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatSidebar;