import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

/**
 * @param {string} text 
 * @param {number} count
 * @returns {Promise<Array<{question: string, answer: string,difficulty: string}>>}
 */

export const generateFlashcards = async (text, count) => {
    const prompt = `Generate exactly ${count} flashcards based on the following text. Each flashcard as :
    Q:[Clear, specific question]
    A:[Concise, accurate answer]
    D:[Difficulty level: easy, medium, or hard]
    Separate each flashcard "---"
    Text:
    ${text.substring(0, 15000)}`;
    try {
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents:prompt,
            
        });

    const generatedText = response.text;
    const flashcards = [];
    const flashcardParts = generatedText.split('---').filter(c=> c.trim());
    for (const card of cards) {

        const lines = card.trim().split('\n');
        let question = '';
        let answer = '';
        let difficulty = 'medium';
    
        for (const line of lines) {
            if (line.startsWith('Q:')) {
                question = line.substring(2).trim();
            } else if (line.startsWith('A:')) {
                answer = line.substring(2).trim();
            } else if (line.startsWith('D:')) {
              const diff = line.substring(2).trim().toLowerCase();
              if (['easy', 'medium', 'hard'].includes(diff)) {
                  difficulty = diff;
              }
            }
        }
        if (question && answer) {
            flashcards.push({ question, answer, difficulty });
        }
    }
    return flashcards.slice(0, count);
} catch (error) {
        console.error('Gemini Api error :', error);
        throw new Error('Failed to generate flashcards');
    }
    
};

/**
 * @param {string} text 
 * @param {number} numQuestions
 * @returns {Promise<Array<{question: string, options: string[], correctAnswer: string,explanation: string,difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions) => {
   const prompt = `Generate exactly ${numQuestions} multiple-choice quiz questions based on the following text. Each question should have 4 options (A, B, C, D) with one correct answer. Format each question as:
Q: [Clear, specific question]
A: [Option A]
B: [Option B]
C: [Option C]
D: [Option D]
Correct: [Correct option letter: A, B, C, or D]
Explanation: [Concise explanation of the correct answer]
Difficulty: [Difficulty level: easy, medium, or hard]
Separate each question with "---"
Text:
${text.substring(0, 15000)}`;
try {
    const response = await ai.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });

    const generatedText = response.text;
    const quizQuestions = [];
    const questionParts = generatedText.split('---').filter(q => q.trim());
    for (const part of questionParts) {
        const lines = part.trim().split('\n');
        let question = '';
        const options = [];
        let correctAnswer = '';
        let explanation = '';
        let difficulty = 'medium';

        for (const line of lines) { 
            if (line.startsWith('Q:')) {
                question = line.substring(2).trim();
            }   else if (line.startsWith('A:')) {       
                options.push(line.substring(2).trim());
            } else if (line.startsWith('Correct:')) {
                correctAnswer = line.substring(8).trim();
            } else if (line.startsWith('Explanation:')) {
                explanation = line.substring(12).trim();
            } else if (line.startsWith('Difficulty:')) {
                const diff = line.substring(11).trim().toLowerCase();
                if (['easy', 'medium', 'hard'].includes(diff)) {
                    difficulty = diff;
                }
            }
        }
        if (question && options.length > 0 && correctAnswer && explanation) {
            quizQuestions.push({ question, options, correctAnswer, explanation, difficulty });
        }
    }
    return quizQuestions.slice(0, numQuestions);
} catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate quiz');
    }
};

export const generateSummary = async (text) => {
    const prompt = `Summarize the following text in a concise and clear manner, highlighting the key points and main ideas. Text:
    ${text.substring(0, 15000)}`;
    try {
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary');
    }
};  
/**
 * @param {string} question
 * @param {Array<Objects>} chunks
 * @returns {Promise<string>}
 */

export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `Chunk ${i + 1}:\n${c}`).join('\n\n');
    const prompt = `Answer the following question based on the provided context. If the answer is not in the context, say "I don't know". Context:
${context}
Question: ${question}
Answer:`
;
    try {
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate answer');
    }
};

export const explainConcept = async (concept) => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear , educational explanation suitable for a student learning this concept for the first time. If the concept is not well-known or cannot be explained, say "I don't know". Concept: ${concept}
    
    Context: 
    ${context.substring(0, 10000)}`;
    try {
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to explain concept');
    }   
  };