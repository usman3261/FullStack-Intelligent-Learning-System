import axiosInstance from './axiosInstance';
import {API_PATHS} from '../constants/apiPaths';

const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.PROGRESS_GET_DASHBOARD);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const progressService = {
  getDashboardData,
};

export default progressService;