import express from 'express';
import { 
    generateFlashcards, 
    generateQuiz, 
    generateSummary, 
    chat, 
    explainConcept, 
    getChatHistory 
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js'; // Ensure this matches your export in auth.js

const router = express.Router();

// FIX: Change 'app' to 'router'
router.use(protect); 

router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', generateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.get('/chat-history/:documentId', getChatHistory);
router.post('/explain-concept', explainConcept);

export default router;