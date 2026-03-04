import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from "../utils/textChunker.js";

/**
 * @desc    Generate Flashcards from document text
 */
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;
        // CHANGE: Changed status from 'ready' to 'processed'
        const document = await Document.findOne({ _id: documentId, userId: req.user.id, status: 'processed' });

        if (!document) return res.status(404).json({ success: false, error: 'Document not found or still processing' });

        const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));

        const flashcardSet = await Flashcard.create({
            userId: req.user.id,
            documentId: document._id,
            cards: cards.map((item) => ({
                question: item.question,
                answer: item.answer,
                difficulty: item.difficulty || 'medium'
            }))
        });

        res.json({ success: true, data: flashcardSet });
    } catch (error) { next(error); }
};

/**
 * @desc    Generate a Quiz from document text
 */
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        // CHANGE: Changed status from 'ready' to 'processed'
        const document = await Document.findOne({ _id: documentId, userId: req.user.id, status: 'processed' });

        if (!document) return res.status(404).json({ success: false, error: 'Document not found or still processing' });

        const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));

        const quiz = await Quiz.create({
            userId: req.user.id,
            documentId: document._id,
            title: title || `${document.title} Quiz`,
            questions: questions,
            totalQuestions: questions.length
        });

        res.status(201).json({ success: true, data: quiz });
    } catch (error) { next(error); }
};

/**
 * @desc    Generate a summary of the document
 */
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        // CHANGE: Changed status from 'ready' to 'processed'
        const document = await Document.findOne({ _id: documentId, userId: req.user.id, status: 'processed' });

        if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

        const summary = await geminiService.generateSummary(document.extractedText);
        document.summary = summary;
        await document.save();

        res.json({ success: true, data: { summary } });
    } catch (error) { next(error); }
};

/**
 * @desc    RAG Chat with Document context
 */
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;
        // CHANGE: Changed status from 'ready' to 'processed'
        const document = await Document.findOne({ _id: documentId, userId: req.user.id, status: 'processed' });

        if (!document) return res.status(404).json({ success: false, error: 'Document not ready' });

        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.index);
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // Update chat history
        await ChatHistory.findOneAndUpdate(
            { userId: req.user.id, documentId: document._id },
            { $push: { 
                messages: { 
                    role: 'user', 
                    content: question, 
                    timestamp: new Date() 
                }
            }},
            { upsert: true }
        );

        await ChatHistory.findOneAndUpdate(
            { userId: req.user.id, documentId: document._id },
            { $push: { 
                messages: { 
                    role: 'assistant', 
                    content: answer, 
                    timestamp: new Date(), 
                    relevantChunks: chunkIndices 
                }
            }}
        );

        res.json({ success: true, data: { answer, relevantChunks: chunkIndices } });
    } catch (error) { next(error); }
};

/**
 * @desc    Explain a specific concept within document context
 */
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        if (!documentId || !concept) return res.status(400).json({ success: false, error: 'Missing parameters' });

        // CHANGE: Changed status from 'ready' to 'processed'
        const document = await Document.findOne({ _id: documentId, userId: req.user.id, status: 'processed' });
        if (!document) return res.status(404).json({ success: false, error: 'Document not ready' });

        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(chunk => chunk.content).join('\n');
        
        const explanation = await geminiService.explainConcept(concept, context);

        res.json({ 
            success: true, 
            data: { concept, explanation, relevantChunks: relevantChunks.map(c => c.index) } 
        });
    } catch (error) { next(error); }
};

/**
 * @desc    Retrieve chat history
 */
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const chatHistory = await ChatHistory.findOne({ userId: req.user.id, documentId }).select('messages');
        res.json({ success: true, data: chatHistory ? chatHistory.messages : [] });
    } catch (error) { next(error); }
};