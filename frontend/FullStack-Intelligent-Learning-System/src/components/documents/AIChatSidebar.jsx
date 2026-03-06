import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Send, X, Loader2, User, Bot, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const AIChatSidebar = ({ documentId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(true);
    const chatEndRef = useRef(null);

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
                if (res.data.success) {
                    setMessages(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load chat history");
            } finally {
                setFetchingHistory(false);
            }
        };
        fetchHistory();
    }, [documentId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        const question = input;
        setInput('');
        setLoading(true);

        try {
            const res = await axiosInstance.post(API_PATHS.AI.CHAT, {
                documentId,
                question
            });

            if (res.data.success) {
                const botMessage = { 
                    role: 'assistant', 
                    content: res.data.data.answer, 
                    timestamp: new Date() 
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (err) {
            toast.error("AI is busy. Please try again in a moment.");
            // Remove the user message if the bot fails to answer
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-400" />
                    <span className="font-bold text-sm">Document AI Tutor</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {fetchingHistory ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-emerald-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 px-6">
                        <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bot size={24} />
                        </div>
                        <p className="text-slate-500 text-sm">
                            Ask me anything about this document! I can explain complex terms or summarize sections.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm' 
                                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                <Bot size={14} className="text-slate-600" />
                            </div>
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                                <Loader2 size={16} className="animate-spin text-emerald-600" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatSidebar;