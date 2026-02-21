import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const getQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }
};

const submitQuiz = async (quizId, answers) => {
    try {
        const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const quizService = {
    getQuizzesForDocument,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
};

export default quizService;