import dotenv from 'dotenv';
dotenv.config();    

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
 
// Initialize Database
connectDB();

/** * TEMPORARY FIX: Drop the ghost 'name' index 
 */
const dropOldIndex = async () => {
    mongoose.connection.once('open', async () => {
        try {
            const adminDb = mongoose.connection.db;
            const collections = await adminDb.listCollections({ name: 'users' }).toArray();
            
            if (collections.length > 0) {
                await adminDb.collection('users').dropIndex('name_1');
                console.log('Successfully dropped old "name" index');
            }
        } catch (err) {
            console.log('Old index "name_1" not found or already dropped.');
        }
    });
};
dropOldIndex();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);

// Error Handling
app.use(errorHandler);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        statusCode: '404',
    });
});

const PORT = process.env.PORT || 8000;

// FIXED: Capture the server instance to set timeouts
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

/**
 * ⚡ CRITICAL FOR OLLAMA:
 * Since local AI processing can take time (summarizing 20 pages), 
 * we set the timeout to 5 minutes so the connection doesn't drop.
 */
server.timeout = 300000; 

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});