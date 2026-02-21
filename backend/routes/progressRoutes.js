import express from 'express';
import {getDashboard} from '../controllers/progressController.js';

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboard);

export default router;