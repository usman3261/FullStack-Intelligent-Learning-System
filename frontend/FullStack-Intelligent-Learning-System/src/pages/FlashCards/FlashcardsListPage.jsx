import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
    BrainCircuit, ChevronLeft, ChevronRight, 
    RefreshCcw, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                // CHANGED: Using centralized API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS
                const res = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
                if (res.data.success) {
                    // Flattening cards from all sets into a single array for the study session
                    const allCards = res.data.data.flatMap(set => 
                        set.cards.map(card => ({ 
                            ...card, 
                            setId: set._id, 
                            docTitle: set.documentId?.title || "Unknown Document" 
                        }))
                    );
                    setFlashcardSets(allCards);
                }
            } catch (err) {
                toast.error("Failed to load flashcards. Please try again.");
                console.error("Flashcard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashcards();
    }, []);

    const nextCard = () => {
        setIsFlipped(false);
        // Small delay to allow the card to reset flip state before changing content
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcardSets.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcardSets.length) % flashcardSets.length);
        }, 150);
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    if (flashcardSets.length === 0) return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
                <BrainCircuit size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Flashcards Yet</h2>
            <p className="text-slate-500 mt-2 max-w-md">
                Generate flashcards from your documents to start your study session!
            </p>
        </div>
    );

    const currentCard = flashcardSets[currentIndex];

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BrainCircuit className="text-emerald-600" /> Study Mode
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Card {currentIndex + 1} of {flashcardSets.length} • {currentCard.docTitle}
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentCard.difficulty === 'hard' ? 'bg-rose-100 text-rose-600' :
                        currentCard.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                        {currentCard.difficulty}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-10">
                <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="group perspective w-full max-w-2xl h-80 cursor-pointer"
                >
                    <div className={`relative w-full h-full duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front Side */}
                        <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-10 text-center">
                            <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">Question</span>
                            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800 leading-snug">
                                {currentCard.question}
                            </h2>
                            <div className="absolute bottom-6 flex items-center gap-2 text-slate-400 text-xs font-medium italic">
                                <RefreshCcw size={14} /> Click to flip
                            </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden bg-emerald-600 rotate-y-180 rounded-3xl shadow-xl flex flex-col items-center justify-center p-10 text-center text-white">
                            <span className="text-emerald-200 font-bold text-xs uppercase tracking-widest mb-4">Answer</span>
                            <p className="text-lg lg:text-xl font-medium leading-relaxed">
                                {currentCard.answer}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <button 
                        onClick={prevCard}
                        className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm"
                        title="Previous Card"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <button 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <RefreshCcw size={16} /> Flip Card
                    </button>

                    <button 
                        onClick={nextCard}
                        className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm"
                        title="Next Card"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardsListPage;