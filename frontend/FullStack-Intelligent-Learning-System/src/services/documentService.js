import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getDocuments = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.DOCUMENTS.GET_ALL);
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }   
};

const uploadDocument = async (formData) => {
    try {
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const deleteDocument = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DOCUMENTS.DELETE(id));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const getDocumentById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.DOCUMENTS.GET_BY_ID(id));
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const documentService = {
    getDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentById
};

export default documentService;