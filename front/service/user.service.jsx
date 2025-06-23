import AxiosClient from "./caller.service";
import * as SecureStore from 'expo-secure-store';
import api from './api'

const register = (data) => {
    return AxiosClient.post('/auth/register', data);
       
}

const login = (data) => {
    return AxiosClient.post('auth/login', data);
       
}

const logout = (token) => {
    return AxiosClient.post('/auth/logout', {token});
}

const getUserById = async (userId) => {
  
   
    
    return AxiosClient.get(`/auth/user/${userId}` );
}

const deletePicture = (data) => {
    return AxiosClient.put(`/auth/picture/delete`, data);
}

const uploadProfilePicture = (data) => {
    return AxiosClient.post('/auth/uploadProfilePicture', data);
}

const editUsername = (data) => {
    return AxiosClient.put('/auth/edit/username', data);
}

const editEmail = (data) => {
    return AxiosClient.put('/auth/edit/email', data);
}

const editPassword = (data) => {
    return AxiosClient.put('/auth/edit/password', data);
}

const getAllPicturesbyUserId = (userId) => {
    return AxiosClient.get(`/auth/pictures/${userId}`);
}

const resetPassword = (data) => {
    return AxiosClient.post('/auth/forgot-password', data);
}

const resetPasswordFinalize = (data) => {
    return AxiosClient.post('/auth/reset-password', data);
}

const sendResetLink = () => {
    const token = localStorage.getItem("userToken");
    return AxiosClient.post(
      "/9auth/profile/send-reset-password",
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  };




export const UserService = {
    register,
    login,
    getUserById,
    deletePicture,
    uploadProfilePicture,
    editUsername,
    editEmail,
    editPassword,
    getAllPicturesbyUserId,
    resetPassword,
    resetPasswordFinalize,
    sendResetLink,
    logout


}