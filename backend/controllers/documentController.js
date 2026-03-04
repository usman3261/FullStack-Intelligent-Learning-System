import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from "mongoose";
import path from 'path';

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const { title } = req.body;
        const documentTitle = title || req.file.originalname;

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        // FIX: Matches 'userId' and lowercase 'processing'
        const document = await Document.create({
            userId: req.user.id, 
            title: documentTitle,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing' 
        });

        // Background Processing
        processPDFInBackground(document._id, req.file.path).catch(err => {
            console.error(`Processing Error: ${err}`);
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded and processing started.',
            data: document
        });

    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        next(error);
    }
};

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcards'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcards' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            { $project: { extractedText: 0, chunks: 0 } },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json({ success: true, data: documents });
    } catch (error) { next(error); }
};

export const getDocumentById = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) return res.status(404).json({ success: false, message: 'Not found' });
        
        document.lastAccessedAt = Date.now();
        await document.save();
        res.status(200).json({ success: true, data: document });
    } catch (error) { next(error); }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) return res.status(404).json({ success: false, message: 'Not found' });

        const fileName = path.basename(document.filePath);
        await fs.unlink(`./uploads/${fileName}`).catch(() => {});
        await Document.findByIdAndDelete(document._id);
        
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
};

const processPDFInBackground = async (documentId, filePath) => {
    try {
        const text = await extractTextFromPDF(filePath);
        const rawChunks = chunkText(text, 1000, 100);
        
        const formattedChunks = rawChunks.map((c, i) => ({
            content: c,
            chunkIndex: i,
            pageNumber: 0
        }));

        await Document.findByIdAndUpdate(documentId, { 
            extractedText: text,
            chunks: formattedChunks,
            status: 'processed' // Matches enum 'processed'
        });
    } catch (error) {
        await Document.findByIdAndUpdate(documentId, { status: 'error' });
    }
};