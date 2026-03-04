import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Loader2, ChevronRight, ChevronLeft, Send, HelpCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ(quizId));
                setQuiz(res.data.data);
            } catch (err) {
                toast.error("Failed to load quiz questions");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, navigate]);

    const handleOptionSelect = (optionIdx) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIdx]: optionIdx
        });
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(selectedAnswers).length;
        if (answeredCount < quiz.questions.length) {
            if (!window.confirm(`You've only answered ${answeredCount}/${quiz.questions.length} questions. Submit anyway?`)) return;
        }

        setSubmitting(true);
        try {
            // Map selectedAnswers to the format your backend expects
            const submissionData = {
                answers: quiz.questions.map((q, idx) => ({
                    questionId: q._id,
                    selectedOption: selectedAnswers[idx] ?? null
                }))
            };

            const res = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), submissionData);
            
            if (res.data.success) {
                toast.success("Quiz submitted successfully!");
                navigate(`/quizzes/${quizId}/results`);
            }
        } catch (err) {
            toast.error("Failed to submit quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={40} /></div>;

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Quiz Header & Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                            <p className="text-slate-500 text-sm">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                            <Clock size={18} />
                            <span className="font-mono font-bold">Untimed</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-emerald-500 h-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6">
                    <div className="flex gap-4 mb-6">
                        <span className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                            {currentQuestionIdx + 1}
                        </span>
                        <h2 className="text-xl font-semibold text-slate-800 leading-relaxed">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                                    selectedAnswers[currentQuestionIdx] === idx
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-100 hover:border-slate-300 bg-white text-slate-600'
                                }`}
                            >
                                <span className="font-medium">{option}</span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedAnswers[currentQuestionIdx] === idx
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-slate-300 group-hover:border-slate-400'
                                }`}>
                                    {selectedAnswers[currentQuestionIdx] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        disabled={currentQuestionIdx === 0}
                        className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    {currentQuestionIdx === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                        >
                            Next Question <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                    <HelpCircle className="text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700 italic">
                        Tip: These questions were generated by AI based on your document. Your results will be saved to your learning progress.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuizTakePage;