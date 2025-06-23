
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/service/context.provider';

export default function PublicRoute({ children }: { children: ReactNode }) {
  const { connectedUserRefreshToken } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (connectedUserRefreshToken) {
      console.log(connectedUserRefreshToken);
      
      router.replace('/private/Home');
    }
  }, [connectedUserRefreshToken]);

 
  if (connectedUserRefreshToken) return null;
  return <>{children}</>;
}
