import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

/**
 * @desc    Get all stats for the Dashboard (including chart data)
 * @route   GET /api/progress/dashboard
 */
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id; // Use consistent .id from auth middleware

        // 1. Core Counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.find({ 
            userId, 
            completedAt: { $ne: null } 
        }).sort({ completedAt: 1 }); // Sorted oldest to newest for the chart

        // 2. Flashcard Metrics
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcardsCount = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            // Check if your schema uses .cards or .flashcards (aiController used .cards)
            const cardsArray = set.cards || set.flashcards || [];
            totalFlashcardsCount += cardsArray.length;
            reviewedFlashcards += cardsArray.filter(c => c.reviewCount > 0).length;
            starredFlashcards += cardsArray.filter(c => c.isStarred).length;
        });

        // 3. Learning Curve (Chart Data)
        // This creates the [ {date, score}, ... ] format for Recharts
        const chartData = completedQuizzes.map(q => ({
            date: new Date(q.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.round(((q.score || 0) / (q.totalQuestions || 1)) * 100),
            title: q.title
        }));

        // 4. Calculate Average Accuracy
        const averageScore = completedQuizzes.length > 0 
            ? (completedQuizzes.reduce((sum, q) => sum + ((q.score / q.totalQuestions) * 100), 0) / completedQuizzes.length)
            : 0;

        // 5. Recent Activity
        const recentDocuments = await Document.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title fileName status createdAt');

        const recentQuizzes = await Quiz.find({ userId, completedAt: { $ne: null } })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt');

        // Randomized streak for now (can be replaced with real daily logic)
        const studyStreak = 5;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets: flashcardSets.length,
                    totalFlashcards: totalFlashcardsCount,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzesCount: completedQuizzes.length,
                    averageScore: Math.round(averageScore),
                    studyStreak,
                    chartData // Sent to the frontend for the progress graph
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });
    } catch (error) {
        next(error);
    }
};