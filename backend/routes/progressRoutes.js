import express from 'express';
import { getDashboard } from '../controllers/progressController.js';
// ADD THIS LINE
import protect from '../middleware/auth.js'; 

const router = express.Router();

// Now 'protect' is defined and will work
router.use(protect);

router.get('/dashboard', getDashboard);

export default router;