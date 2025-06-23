import { Slot, Stack } from 'expo-router';
import CheckAuth from '@/service/CheckAuth';

export default function PrivateLayout() {
  return (
    <CheckAuth>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" />
        <Stack.Screen name="Profile" />
        <Stack.Screen name="ProfilePictureUpload" />
        {/* <Stack.Screen name="settings" /> */}
      </Stack>
    </CheckAuth>
  );
}