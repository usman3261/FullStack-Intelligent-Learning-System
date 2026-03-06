import Document from "../models/Document.js";
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Handles PDF Upload and initiates background processing
 */
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const { title } = req.body;
        const documentTitle = title || req.file.originalname;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        // Create initial record
        const document = await Document.create({
            userId: req.user.id, 
            title: documentTitle,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing' 
        });

        // Trigger background extraction
        processPDFInBackground(document._id, req.file.path).catch(err => {
            console.error(`Background Thread Crash: ${err.message}`);
        });

        res.status(201).json({
            success: true,
            message: 'Upload successful. Processing started...',
            data: document
        });

    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        next(error);
    }
};

/**
 * Background Task: Extracts text and updates status
 * FIXED: Mapping the chunks correctly to avoid CastError
 */
const processPDFInBackground = async (documentId, filePath) => {
    try {
        let extractedText = "";
        
        try {
            extractedText = await extractTextFromPDF(filePath);
        } catch (parserError) {
            console.error(`--- Parser Warning for ${documentId} ---`);
            extractedText = "[System: Manual text extraction failed. AI features may have limited context.]";
        }

        // IMPORTANT FIX: 
        // Ensure rawChunks is just an array of strings. 
        // If chunkText returns objects, we extract just the string content.
        const rawChunks = chunkText(extractedText, 1000, 100);
        
        const formattedChunks = rawChunks.map((chunk, i) => {
            // Check if chunk is an object or a string to prevent double nesting
            const contentString = typeof chunk === 'string' ? chunk : (chunk.content || "");
            
            return {
                content: contentString, 
                chunkIndex: i,
                pageNumber: 1
            };
        });

        await Document.findByIdAndUpdate(documentId, { 
            extractedText: extractedText,
            chunks: formattedChunks,
            status: 'processed' 
        });

        console.log(`✅ Document ${documentId} successfully processed.`);

    } catch (criticalError) {
        console.error("Critical Background Error:", criticalError.message);
        await Document.findByIdAndUpdate(documentId, { status: 'error' });
    }
};

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: documents });
    } catch (error) { next(error); }
};

export const getDocumentById = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
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
        
        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) { next(error); }
};