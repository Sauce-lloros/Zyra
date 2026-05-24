import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="home" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="public-profile" />
          <Stack.Screen name="create-post" />
          <Stack.Screen name="edit-post" />
          <Stack.Screen name="search" />
          <Stack.Screen name="connections" />
          <Stack.Screen name="chats" />
          <Stack.Screen name="chat-room" />
          <Stack.Screen name="notifications" />
        </Stack>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}