import { Redirect } from 'expo-router';
import { useUser } from '@/service/context.provider';

export default function Index() {
  const { connectedUserToken } = useUser();

  return (
    <Redirect
      href={ connectedUserToken ? '/private/Home' : '/auth/Main' }
      
    />
  );
}