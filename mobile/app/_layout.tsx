import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Pradinio prisijungimo / PIN / biometrijos ekranas */}
        <Stack.Screen name="index" />
        
        {/* Įrenginio aktyvavimo ekranas */}
        <Stack.Screen name="activate" />
        
        {/* Pagrindinis kasos ekranas */}
        <Stack.Screen name="pos" />
      </Stack>
    </>
  );
}