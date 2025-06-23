import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/service/context.provider';

function parseJwt(token: string) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function CheckAuth({ children }: { children: ReactNode }) {
  const {
    connectedUserRefreshToken,
    setConnectedUserAccessToken,
    setConnectedUserRefreshToken,
    setConnectedUserId
  } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!connectedUserRefreshToken) {
      router.replace('/auth/Main');
      return;
    }
    const decoded: any = parseJwt(connectedUserRefreshToken);
    if (!decoded?.exp) {
      doLogout(); return;
    }
    const now = Date.now();
    const expiresAt = decoded.exp * 1000;
    if (expiresAt <= now) {
      doLogout(); return;
    }
    const timer = setTimeout(doLogout, expiresAt - now);
    return () => clearTimeout(timer);

    async function doLogout() {
      await setConnectedUserAccessToken(null);
      await setConnectedUserRefreshToken(null);
      await setConnectedUserId(null);
      router.replace('/auth/Main');
    }
  }, [connectedUserRefreshToken]);

  if (!connectedUserRefreshToken) return null;
  return <>{children}</>;
}
