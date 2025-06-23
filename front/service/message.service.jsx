import AxiosClient from "./caller.service";
import * as SecureStore from 'expo-secure-store';
import api from './api'


const getMessagesWith = (otherUserId) => {

    api.get(`/messages/with/${otherUserId}`);
}

const getContact = () => {
    return AxiosClient.get('/messages/contacts')
}

const getHistory = (otherId) => {
  return AxiosClient.get(`/messages/history/${otherId}`)
}

const create = (msg) => {
  return AxiosClient.post(`/messages/`, msg)
}
// const getListingsById = (listingId) => {

//   return AxiosClient.get(`listings/${listingId}` );
// }

export const MessagesService = {

  getMessagesWith,
  getContact,
  getHistory,
  create

};