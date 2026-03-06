import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import * as geminiService from "../utils/geminiService.js";

/**
 * NEW: Generates a concise summary of the document
 */
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });

        if (!document) return res.status(404).json({ success: false, message: "Document not found" });

        const summary = await geminiService.generateSummary(document.extractedText);

        // Update the document with the new summary
        document.summary = summary;
        await document.save();

        res.status(200).json({
            success: true,
            data: { summary }
        });
    } catch (error) {
        console.error("Summary Gen Error:", error.message);
        next(error);
    }
};

/**
 * Handles real-time AI Chat based on document context
 */
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        
        if (!document) return res.status(404).json({ success: false, message: "Document context not found." });

        const answer = await geminiService.generateChatResponse(document.extractedText, question);

        res.status(200).json({ success: true, data: { answer } });
    } catch (error) {
        console.error("AI Chat Controller Error:", error.message);
        next(error);
    }
};

/**
 * Explains a specific concept from the document
 */
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });

        if (!document) return res.status(404).json({ success: false, message: "Document not found" });

        const explanation = await geminiService.explainConcept(document.extractedText, concept);

        res.status(200).json({ success: true, data: { explanation } });
    } catch (error) {
        console.error("Explain Concept Error:", error.message);
        next(error);
    }
};

/**
 * Generates and saves a set of Flashcards
 */
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });

        if (!document) return res.status(404).json({ success: false, message: "Document not found" });

        const flashcardsData = await geminiService.generateFlashcards(document.extractedText);
        
        const flashcardSet = await Flashcard.create({
            userId: req.user.id,
            documentId,
            cards: flashcardsData
        });

        res.status(201).json({ success: true, data: flashcardSet });
    } catch (error) { 
        console.error("Flashcard Gen Error:", error.message);
        next(error); 
    }
};

/**
 * Generates and saves a Multiple Choice Quiz
 */
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });

        if (!document) return res.status(404).json({ success: false, message: "Document not found" });

        const quizData = await geminiService.generateQuiz(document.extractedText);
        
        const quiz = await Quiz.create({
            userId: req.user.id,
            documentId,
            title: `Quiz: ${document.title}`,
            questions: quizData
        });

        res.status(201).json({ success: true, data: quiz });
    } catch (error) { 
        console.error("Quiz Gen Error:", error.message);
        next(error); 
    }
};

/**
 * Fetches Chat History
 */
export const getChatHistory = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: [] });
    } catch (error) { next(error); }
};