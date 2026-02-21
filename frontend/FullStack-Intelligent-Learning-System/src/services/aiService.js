import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getFlashcards= async(documentId,options)=>{
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS,{documentId,...options});

        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const generateQuiz= async(documentId,options)=>{
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ,{documentId,...options});

        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const generateSummary= async(documentId)=>{
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY,{documentId});

        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const chat= async(documentId,message)=>{
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT,{documentId,question:message});

        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const explainConcept= async(documentId,concept)=>{
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT,{documentId,concept});

        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const getChatHistory= async(documentId)=>{
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }       
};

const aiService = {
    getFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
};

export default aiService;