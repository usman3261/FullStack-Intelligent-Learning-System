import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
}

// 1. JSON Model (For Quizzes and Flashcards)
const jsonModel = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: "application/json" } 
});

// 2. Text Model (For Summaries and Chat)
const textModel = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash' 
});

/**
 * @desc Generates Flashcards as a JSON array
 */
export const generateFlashcards = async (text, count) => {
    const prompt = `System: You are an educational assistant. Generate exactly ${count} flashcards.
    User: Create a JSON array of objects based on this text. Each object MUST have: 
    "question" (string), "answer" (string), and "difficulty" (string: easy, medium, or hard).
    
    Text: ${text.substring(0, 20000)}`;

    try {
        const result = await jsonModel.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error('Gemini Flashcard Error:', error);
        throw new Error('Failed to generate flashcards');
    }
};

/**
 * @desc Generates a Quiz as a JSON array
 */
export const generateQuiz = async (text, numQuestions) => {
   const prompt = `System: You are an expert examiner. Generate exactly ${numQuestions} multiple-choice questions.
   User: Create a JSON array of objects with keys: 
   "question" (string), "options" (array of 4 strings), "correctAnswer" (string - the text content of the correct option), "explanation" (string).
   
   Text: ${text.substring(0, 20000)}`;

    try {
        const result = await jsonModel.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error('Gemini Quiz Error:', error);
        throw new Error('Failed to generate quiz');
    }
};

/**
 * @desc Standard Text Summary
 */
export const generateSummary = async (text) => {
    const prompt = `Summarize the following text clearly using structured bullet points. 
    Focus on the core concepts and key takeaways.
    
    Text: ${text.substring(0, 20000)}`;

    try {
        const result = await textModel.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Gemini Summary Error:', error);
        throw new Error('Failed to generate summary');
    }
};

/**
 * @desc RAG Chat with provided chunks
 */
export const chatWithContext = async (question, chunks) => {
    const contextText = chunks.map((c) => (typeof c === 'string' ? c : c.content)).join('\n\n');

    const prompt = `System: You are an AI tutor. Answer the user's question using ONLY the context provided below. 
    If the answer is not in the context, politely say you don't know based on the document.
    
    Context: ${contextText}
    
    User Question: ${question}`;

    try {
        const result = await textModel.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw new Error('Failed to generate answer');
    }
};

/**
 * @desc Concept Explainer
 */
export const explainConcept = async (concept, context = "") => {
    const prompt = `System: You are a teaching assistant. 
    User: Explain the concept "${concept}" in simple terms. 
    Use this context if relevant: ${context.substring(0, 5000)}`;

    try {
        const result = await textModel.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Gemini Concept Error:', error);
        throw new Error('Failed to explain concept');
    }   
};