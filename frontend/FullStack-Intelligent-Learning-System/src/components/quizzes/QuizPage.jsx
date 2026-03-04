import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizPage = ({ quizData }) => {
    const [answers, setAnswers] = useState({}); // Stores { questionId: selectedOptionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleOptionSelect = (qId, optIdx) => {
        if (submitted) return;
        setAnswers({ ...answers, [qId]: optIdx });
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < quizData.questions.length) {
            return toast.error("Please answer all questions before submitting");
        }

        let totalScore = 0;
        quizData.questions.forEach(q => {
            if (answers[q._id] === q.correctOption) totalScore++;
        });

        setScore(totalScore);
        setSubmitted(true);
        toast.success(`Quiz Completed! Your score: ${totalScore}/${quizData.questions.length}`);
        // Here you would call axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizData._id), { score: totalScore })
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{quizData.title}</h1>
                <p className="text-slate-500 mt-2">Select the best answer for each question.</p>
            </div>

            <div className="space-y-8">
                {quizData.questions.map((q, idx) => (
                    <div key={q._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{idx + 1}. {q.questionText}</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, optIdx) => {
                                const isSelected = answers[q._id] === optIdx;
                                const isCorrect = optIdx === q.correctOption;
                                
                                let btnClass = "p-4 rounded-xl border-2 text-left transition-all ";
                                if (isSelected) btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 ";
                                else btnClass += "border-slate-100 hover:border-slate-300 bg-slate-50 ";

                                if (submitted && isCorrect) btnClass = "p-4 rounded-xl border-2 border-green-500 bg-green-50 text-green-700 flex justify-between";

                                return (
                                    <button 
                                        key={optIdx} 
                                        onClick={() => handleOptionSelect(q._id, optIdx)}
                                        className={btnClass}
                                    >
                                        {opt}
                                        {submitted && isCorrect && <CheckCircle2 size={18} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleSubmit}
                disabled={submitted}
                className="mt-10 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50"
            >
                {submitted ? `Final Score: ${score} / ${quizData.questions.length}` : 'Submit Quiz Results'}
            </button>
        </div>
    );
};

export default QuizPage;