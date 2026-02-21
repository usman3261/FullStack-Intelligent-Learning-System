import express from 'express';
import { submitQuiz, getQuizzes, getQuizById, getQuizResults, deleteQuiz } from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/:id/submit', submitQuiz);
router.get('/:documentId', getQuizzes);
router.get('/quiz/:id', getQuizById);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;