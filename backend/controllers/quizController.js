import Quiz from '../models/Quiz.js';

export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user.id,
            documentId: req.params.documentId
        }).populate('documentId', 'title fileName')
          .sort({ createdAt: -1 });

        res.json({ success: true, count: quizzes.length, data: quizzes });
    } catch (error) { next(error); }
};

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        res.json({ success: true, data: quiz });
    } catch (error) { next(error); }
};

export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body; // Expecting [{ questionId: "...", selectedOption: 0 }, ...]
        
        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Answers must be an array' });
        }

        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        if (quiz.completedAt) {
            return res.status(400).json({ success: false, message: 'Quiz already completed' });
        }

        let correctCount = 0;
        const userAnswers = [];

        // Loop through the questions defined in the Quiz model
        quiz.questions.forEach((question, index) => {
            // Find the matching answer from the request body
            const submittedAnswer = answers.find(a => a.questionId === question._id.toString());
            const selectedOption = submittedAnswer ? submittedAnswer.selectedOption : null;
            
            // Compare selected option index with the correct option index
            const isCorrect = selectedOption === question.correctOption;
            
            if (isCorrect) correctCount++;

            userAnswers.push({
                questionIndex: index,
                selectedAnswer: selectedOption,
                isCorrect,
                answeredAt: new Date()
            });
        });

        const scorePercentage = (correctCount / quiz.questions.length) * 100;

        quiz.userAnswers = userAnswers;
        quiz.score = correctCount; // Saving raw score, percentage can be calculated on frontend
        quiz.completedAt = new Date();
        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                score: correctCount,
                totalQuestions: quiz.questions.length,
                percentage: Math.round(scorePercentage),
                userAnswers
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) { next(error); }
};

export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('documentId', 'title');

        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        // Ensure we only show results if the quiz was actually taken
        if (!quiz.completedAt) {
            return res.status(400).json({ success: false, message: 'Quiz results are not available yet' });
        }

        // Merge original questions with user answers for a detailed view
        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);
            return {
                questionId: question._id,
                questionText: question.questionText,
                options: question.options,
                selectedOption: userAnswer?.selectedAnswer ?? null,
                correctOption: question.correctOption,
                isCorrect: userAnswer?.isCorrect ?? false,
                explanation: question.explanation
            };
        });

        res.status(200).json({
            success: true,
            data: {
                title: quiz.title,
                document: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.questions.length,
                completedAt: quiz.completedAt,
                questions: detailedResults
            }
        });
    } catch (error) { next(error); }
};

export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) { next(error); }
};