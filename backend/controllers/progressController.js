import { CommandSucceededEvent } from 'mongodb';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

export const getDashboard = async (req, res,next) => {
    try{
       const userId = req.user._id;
       const totalDocuments = await Document.countDocuments({ userId});
       const totalFlashcards = await Flashcard.countDocuments({ userId});
       const totalQuizzes = await Quiz.countDocuments({ userId});
       const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });
       
       const flashcardSets = await Flashcard.find({ userId })
       let totalFlashcardsInSets = 0;
       let reviewdFlashcards = 0;
       let starredFlashcards = 0;
       flashcardSets.forEach(set => {
        totalFlashcardsInSets += set.flashcards.length;
        reviewdFlashcards += set.flashcards.filter(c=>c.reviewedCount > 0).length;
        starredFlashcards += set.flashcards.filter(c=>c.starred).length;
       });

       const quizzes = await Quiz.find({ userId ,completedAt: { $ne: null } });
       const averageScore= quizzes.length > 0 ? 
         (quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length)
       : 0;

       const recentDocuments = await Document.find({ userId })
       .sort({ createdAt: -1 })
       .limit(5)
       .select('title fileName lastAccessed status');

       const recentQuizzes = await Quiz.find({ userId })
         .sort({ completedAt: -1 })
         .limit(5)
         .populate('documentId', 'title')
         .select('title score totalQuestions completedAt');

       const studyStreak= Math.floor(Math.random() * 7) + 1;
       res.status(200).json({
        success: true,
        data: {
            overview: {
                totalDocuments,
                totalFlashcardSets,
                totalFlashcards,
                reviewdFlashcards,
                starredFlashcards,
                totalQuizzes,
                completedQuizzes,
                averageScore,
                studyStreak
            },
            recentActivity: {
                documents:recentDocuments,
                quizzes:recentQuizzes
             }
               
        }
       });
    }
    catch(error){
        next(error);
    }
}