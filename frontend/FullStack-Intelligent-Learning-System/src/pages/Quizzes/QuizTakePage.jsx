import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
    GraduationCap, CheckCircle2, 
    XCircle, ArrowRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // CHANGED: Using centralized API_PATHS for consistency
                const res = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(id));
                if (res.data.success) {
                    setQuiz(res.data.data);
                }
            } catch (err) {
                toast.error("Quiz not found");
                navigate('/documents');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, navigate]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const handleNext = () => {
        const isCorrect = selectedOption === quiz.questions[currentQuestion].correctAnswer;
        
        const newAnswer = {
            question: quiz.questions[currentQuestion].question,
            selected: selectedOption,
            correct: quiz.questions[currentQuestion].correctAnswer,
            isCorrect,
            explanation: quiz.questions[currentQuestion].explanation
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        if (isCorrect) setScore(prev => prev + 1);

        if (currentQuestion + 1 < quiz.questions.length) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedOption(null);
        } else {
            setShowResults(true);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
    );

    if (showResults) {
        return (
            <div className="max-w-3xl mx-auto p-6 lg:p-10 animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-slate-900 p-10 text-center text-white">
                        <div className="inline-flex p-4 rounded-2xl bg-emerald-500/20 mb-4">
                            <GraduationCap size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold">Quiz Complete!</h2>
                        <p className="text-slate-400 mt-2">You scored {score} out of {quiz.questions.length}</p>
                        <div className="mt-8 bg-white/10 p-4 rounded-2xl flex max-w-xs mx-auto">
                             <div className="flex-1 text-2xl font-bold">
                                {Math.round((score / quiz.questions.length) * 100)}%
                             </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <h3 className="font-bold text-slate-800 text-lg border-b pb-4">Review Your Answers</h3>
                        {answers.map((ans, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border-2 ${ans.isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                                <div className="flex gap-3 mb-2">
                                    {ans.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                                    <p className="font-semibold text-slate-800">{ans.question}</p>
                                </div>
                                <div className="ml-8 space-y-2">
                                    <p className="text-sm">
                                        <span className="text-slate-500">Your Answer:</span> 
                                        <span className={`ml-2 font-medium ${ans.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{ans.selected}</span>
                                    </p>
                                    {!ans.isCorrect && (
                                        <p className="text-sm">
                                            <span className="text-slate-500">Correct Answer:</span> 
                                            <span className="ml-2 font-medium text-emerald-600">{ans.correct}</span>
                                        </p>
                                    )}
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed italic">
                                        <span className="font-bold text-slate-800 block mb-1">AI Explanation:</span>
                                        {ans.explanation}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => navigate('/documents')}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all mt-4"
                        >
                            Back to Documents
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        Question {currentQuestion + 1} / {quiz.questions.length}
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl lg:text-2xl font-semibold text-slate-800 mb-10 leading-relaxed">
                    {question.question}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left font-medium ${
                                selectedOption === option 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md ring-2 ring-emerald-500/20' 
                                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                            }`}
                        >
                            <span>{option}</span>
                            {selectedOption === option && <CheckCircle2 size={20} className="text-emerald-500" />}
                        </button>
                    ))}
                </div>

                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 group"
                    >
                        {currentQuestion + 1 === quiz.questions.length ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizTakePage;