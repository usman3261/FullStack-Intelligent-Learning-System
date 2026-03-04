import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

/**
 * Service for handling all Document-related API calls
 */
export const getDocuments = async () => {
    const response = await axiosInstance.get(API_PATHS.DOCUMENT.GET_DOCUMENTS);
    return response.data;
};

export const getDocumentById = async (id) => {
    const response = await axiosInstance.get(API_PATHS.DOCUMENT.GET_DOCUMENT_BY_ID(id));
    return response.data;
};

export const uploadDocument = async (formData) => {
    const response = await axiosInstance.post(API_PATHS.DOCUMENT.UPLOAD, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, 
    });
    return response.data;
};

export const updateDocument = async (id, data) => {
    const response = await axiosInstance.put(API_PATHS.DOCUMENT.UPDATE_DOCUMENT(id), data);
    return response.data;
};

export const deleteDocument = async (id) => {
    const response = await axiosInstance.delete(API_PATHS.DOCUMENT.DELETE_DOCUMENT(id));
    return response.data;
};

// Bundle them into a default export to satisfy: import documentService from '...'
const documentService = {
    getDocuments,
    getDocumentById,
    uploadDocument,
    updateDocument,
    deleteDocument
};

export default documentService;