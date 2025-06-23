import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface UserContextValue {
  connectedUserId: string | null;
  setConnectedUserId: (id: string | null) => Promise<void>;
  connectedUserRefreshToken: string | null;
  setConnectedUserRefreshToken: (token: string | null) => Promise<void>;
  connectedUserAccessToken: string | null;
  setConnectedUserAccessToken: (token: string | null) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  connectedUserId: null,
  setConnectedUserId: async () => {},
  connectedUserRefreshToken: null,
  setConnectedUserRefreshToken: async () => {},
  connectedUserAccessToken: null,
  setConnectedUserAccessToken: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [connectedUserId, _setConnectedUserId] = useState<string | null>(null);
  const [connectedUserRefreshToken, _setConnectedUserRefreshToken] = useState<string | null>(null);
  const [connectedUserAccessToken, _setConnectedUserAccessToken] = useState<string | null>(null);

  const setConnectedUserId = async (id: string | null) => {
    _setConnectedUserId(id);
    if (id) await SecureStore.setItemAsync('userId', id);
    else await SecureStore.deleteItemAsync('userId');
  };

  const setConnectedUserRefreshToken = async (token: string | null) => {
    _setConnectedUserRefreshToken(token);
    if (token) await SecureStore.setItemAsync('userRefreshToken', token);
    else await SecureStore.deleteItemAsync('userRefreshToken');
  };

  const setConnectedUserAccessToken = async (token: string | null) => {
    _setConnectedUserAccessToken(token);
    if (token) await SecureStore.setItemAsync('userAccessToken', token);
    else await SecureStore.deleteItemAsync('userAccessToken');
  };

  useEffect(() => {
    (async () => {
      const id = await SecureStore.getItemAsync('userId');
      const rt = await SecureStore.getItemAsync('userRefreshToken');
      const at = await SecureStore.getItemAsync('userAccessToken');
      if (id) _setConnectedUserId(id);
      if (rt) _setConnectedUserRefreshToken(rt);
      if (at) _setConnectedUserAccessToken(at);
    })();
  }, []);

  return (
    <UserContext.Provider value={{
      connectedUserId,
      setConnectedUserId,
      connectedUserRefreshToken,
      setConnectedUserRefreshToken,
      connectedUserAccessToken,
      setConnectedUserAccessToken
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
