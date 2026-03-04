import React, { useState } from 'react';
import { RefreshCcw, ChevronLeft, ChevronRight, BrainCircuit } from 'lucide-react';

const FlashcardView = ({ flashcards = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (flashcards.length === 0) return (
        <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <BrainCircuit className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">No flashcards yet. Click "Generate" to start AI analysis.</p>
        </div>
    );

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-2xl mx-auto py-10">
            {/* Flashcard Area */}
            <div 
                className={`relative w-full h-80 cursor-pointer transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front */}
                <div className="absolute inset-0 bg-white border-2 border-emerald-100 rounded-3xl shadow-xl flex items-center justify-center p-10 text-center [backface-visibility:hidden]">
                    <h2 className="text-2xl font-semibold text-slate-800">{currentCard.question}</h2>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-emerald-600 text-white rounded-3xl shadow-xl flex items-center justify-center p-10 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className="text-xl">{currentCard.answer}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-10 px-4">
                <button 
                    disabled={currentIndex === 0}
                    onClick={() => { setCurrentIndex(i => i - 1); setIsFlipped(false); }}
                    className="p-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                    <ChevronLeft />
                </button>
                <span className="font-bold text-slate-500">Card {currentIndex + 1} of {flashcards.length}</span>
                <button 
                    disabled={currentIndex === flashcards.length - 1}
                    onClick={() => { setCurrentIndex(i => i + 1); setIsFlipped(false); }}
                    className="p-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
};

export default FlashcardView;