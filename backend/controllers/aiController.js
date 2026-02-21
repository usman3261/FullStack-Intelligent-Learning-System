import  Document  from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from "../utils/textChunker.js";

export const generateFlashcards = async (req, res,next) => {
    try{
        const { documentId ,count=10} = req.body;

        if (!documentId) {
            return res.status(400).json({ success:false,error: 'Document ID is required' });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status:'ready'
        });
        if (!document) {
            return res.status(404).json({ success:false,error: 'Document not found or not ready' });
        }
        const cards= await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );
        const flashcardSet= await Flashcard.create({
            userId:req.user._id,
            documentId:document._id,
            cards: card.map((card) => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });
        res.json({ success:true,data:flashcardSet,message:'Flashcards generated successfully' });
    }
    catch(error){
        next(error);
    }
};
export const generateQuiz = async (req, res,next) => {
    try{
            const { documentId ,numQuestions=5,title} = req.body;
            if (!documentId) {
                return res.status(400).json({ success:false,error: 'Document ID is required' });
            } 
            const document = await Document.findOne({
                _id: documentId,
                userId: req.user._id,
                status:'ready'
            });
            if (!document) {
                return res.status(404).json({ success:false,error: 'Document not found or not ready' });
            }
            const questions= await geminiService.generateQuiz(
                document.extractedText,
                parseInt(numQuestions),
                title
            );
            const quiz= await Quiz.create({
                userId:req.user._id,
                documentId:document._id,
                title:title ||`${document.title} Quiz`,
                questions: questions,
                totalQuestions: questions.length,
                userAnswers: [],
                score: 0
            });
            res.status(201).json({ success:true,data:quiz,message:'Quiz generated successfully' });
    }
    catch(error){
        next(error);
    }
};
export const generateSummary = async (req, res,next) => {
    try{
            const { documentId } = req.body;
            if (!documentId) {
                return res.status(400).json({ success:false,error: 'Document ID is required' });
            } 
            const document = await Document.findOne({
                _id: documentId,
                userId: req.user._id,
                status:'ready'
            });
            if (!document) {
                return res.status(404).json({ success:false,error: 'Document not found or not ready' });
            }
            const summary= await geminiService.generateSummary(document.extractedText);
            res.json({ success:true,data:{
                documentId: document._id,
                title: document.title,
                summary
            },message:'Summary generated successfully' });
    }
    catch(error){
        next(error);
    }
};
export const chat = async (req, res,next) => {
    try{
        const { documentId, question } = req.body;
        if (!documentId || !question) {
            return res.status(400).json({ success:false,error: 'Document ID and question are required' });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status:'ready'
        });
        if (!document) {
            return res.status(404).json({ success:false,error: 'Document not found or not ready' });
        }
        const relevantChunks = findRelevantChunks(document.chunks, question,3);
        const chunkIndices = relevantChunks.map(chunk => chunk.index);
       
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id,
        });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }
        const answer = await geminiService.chatWithContext(question, relevantChunks);
        chatHistory.messages.push({
            role: 'user',
            content: question,
            timestamp: new Date(),
            relevantChunks:[]
        },
    {
            role: 'assistant',
            content: answer,
            timestamp: new Date(),
             relevantChunks: chunkIndices
    });
        await chatHistory.save();
        res.json({ success:true,data:{
            question,
            answer,
            relevantChunks: chunkIndices,
            chatHistoryId: chatHistory._id
        },message:'Chat response generated successfully' });
    }
    catch(error){
        next(error);
    }
};
export const explainConcept = async (req, res,next) => {
    try{
        const { documentId, concept } = req.body;
        if (!documentId || !concept) {
            return res.status(400).json({ success:false,error: 'Document ID and concept are required' });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status:'ready'
        });
        if (!document) {
            return res.status(404).json({ success:false,error: 'Document not found or not ready' });
        }
        const relevantChunks = findRelevantChunks(document.chunks, concept,3);
        const context = relevantChunks.map(chunk => chunk.content).join('\n');
        const explanation = await geminiService.explainConcept(concept, context);
        res.json({ success:true,data:{
            concept,
            explanation,
            relevantChunks: relevantChunks.map(chunk => chunk.chunkIndex)
        },message:'Concept explanation generated successfully' });
    }
    catch(error){
        next(error);
    }
};
export const getChatHistory = async (req, res,next) => {
    try{
        const { documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ success:false,error: 'Document ID is required' });
        }   
        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId,
        }).select('messages');
        if (!chatHistory) {
            return res.status(404).json({ success:false,error: 'Chat history not found' });
        }
        res.json({ success:true,data:chatHistory.messages,message:'Chat history retrieved successfully' });
    }
    catch(error){
        next(error);
    }
};