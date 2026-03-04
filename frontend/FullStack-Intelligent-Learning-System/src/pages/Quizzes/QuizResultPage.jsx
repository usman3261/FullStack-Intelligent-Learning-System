import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

const QuizResultPage = () => {
    const { quizId } = useParams();
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
                setResult(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchResults();
    }, [quizId]);

    if (!result) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    const percentage = Math.round((result.score / result.totalQuestions) * 100);

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center mb-8">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy size={40} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Quiz Completed!</h1>
                <p className="text-slate-500 mt-2">Here is how you performed on <strong>{result.title}</strong></p>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">Score</p>
                        <p className="text-3xl font-black text-slate-900">{result.score} / {result.totalQuestions}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                        <p className="text-sm text-emerald-600 uppercase font-bold tracking-widest">Accuracy</p>
                        <p className="text-3xl font-black text-emerald-700">{percentage}%</p>
                    </div>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 mb-6">Review Answers</h3>
            <div className="space-y-6">
                {result.questions.map((q, idx) => {
                    const userAnswer = result.userAnswers?.find(a => a.questionId === q._id);
                    const isCorrect = userAnswer?.isCorrect;

                    return (
                        <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                            <div className="flex items-start gap-3">
                                {isCorrect ? <CheckCircle2 className="text-emerald-600 mt-1" /> : <XCircle className="text-rose-600 mt-1" />}
                                <div>
                                    <p className="font-bold text-slate-900">{q.questionText}</p>
                                    <p className="text-sm mt-2">
                                        <span className="text-slate-500">Your Answer:</span> 
                                        <span className={`ml-2 font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {q.options[userAnswer?.selectedOption]}
                                        </span>
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm mt-1 text-slate-600">
                                            <span className="font-bold">Correct Answer:</span> {q.options[q.correctOption]}
                                        </p>
                                    )}
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 flex gap-3">
                                        <HelpCircle size={18} className="text-blue-500 shrink-0" />
                                        <p className="text-xs text-slate-600 italic leading-relaxed">
                                            <strong>AI Explanation:</strong> {q.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={() => navigate('/dashboard')}
                className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
            >
                <ArrowLeft size={18} /> Return to Dashboard
            </button>
        </div>
    );
};

export default QuizResultPage;