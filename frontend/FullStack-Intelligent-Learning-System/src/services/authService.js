import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.LOGIN, {
            email,
            password
        });
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }
};

const register = async (username, email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            username,
            email,
            password
        });
        return response.data;
    }
    catch (error) {        throw error.response ? error.response.data : error;
    }   
};

const getProfile = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }
};

const updateProfile = async (userData) => {
    try {
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }   
};

const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD);
        return response.data;
    }
    catch (error) {
        throw error.response ? error.response.data : error;
    }   
};

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword
};

export default authService;