import { Ollama } from 'ollama';

// Explicitly connect to the local Ollama instance
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

/**
 * Local AI Service using Phi-3 Mini
 * Optimized to prevent UND_ERR_HEADERS_TIMEOUT
 */

export const generateChatResponse = async (context, question) => {
    try {
        const response = await ollama.chat({
            model: 'phi3:mini',
            messages: [{
                role: 'user',
                content: `Context: ${context}\n\nQuestion: ${question}\n\nInstruction: Answer strictly using the context.`
            }],
            stream: false, // CRITICAL: Disable streaming to prevent partial header timeouts
        });
        return response.message.content;
    } catch (error) {
        console.error("Ollama Chat Connection Error:", error.message);
        throw new Error("Local AI is still warming up. Please try again in 10 seconds.");
    }
};

export const generateSummary = async (context) => {
    try {
        const response = await ollama.chat({
            model: 'phi3:mini',
            messages: [{
                role: 'user',
                content: `Summarize this text in 5 bullet points:\n\n${context}`
            }],
            stream: false,
        });
        return response.message.content;
    } catch (error) {
        console.error("Ollama Summary Error:", error.message);
        throw new Error("Local AI summary failed.");
    }
};

export const generateQuiz = async (context) => {
    try {
        const response = await ollama.chat({
            model: 'phi3:mini',
            messages: [{
                role: 'user',
                content: `Generate 5 MCQs from this text. Return ONLY JSON array: [{"question": "", "options": [], "correctAnswer": "", "explanation": ""}]\n\nText: ${context}`
            }],
            stream: false,
        });
        const text = response.message.content;
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Ollama Quiz Error:", error.message);
        throw new Error("Local AI quiz generation failed.");
    }
};

export const generateFlashcards = async (context) => {
    try {
        const response = await ollama.chat({
            model: 'phi3:mini',
            messages: [{
                role: 'user',
                content: `Generate 5 flashcards from this text. Return ONLY JSON array: [{"question": "", "answer": ""}]\n\nText: ${context}`
            }],
            stream: false,
        });
        const cleanJson = response.message.content.replace(/```json|```/gi, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Ollama Flashcard Error:", error.message);
        throw new Error("Local AI flashcard generation failed.");
    }
};