import { Slot, Stack } from 'expo-router';
import PublicRoute from '@/service/PublicRoute';

export default function AuthLayout() {
  return (
    <PublicRoute>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="Register" />
        <Stack.Screen name="Main" />
      </Stack>
    </PublicRoute>
  );
}