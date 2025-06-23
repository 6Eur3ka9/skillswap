import AxiosClient from "./caller.service";
import * as SecureStore from 'expo-secure-store';
import api from './api'

const createListing = (data) => {
    return AxiosClient.post('listings/create-listing', data);
}

const getAllListings = () => {
    return AxiosClient.get('listings/all');
}

const getListingsById = (listingId) => {

  return AxiosClient.get(`listings/${listingId}` );
}

const getListingsByUserId = (userid) => {
    return AxiosClient.get(`listings/user/${userid}`)
}

export const ListingsService = {
    createListing,
    getAllListings,
    getListingsById,
    getListingsByUserId
}