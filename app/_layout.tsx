import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { DoctorProvider } from '../contexts/DoctorContext';
import { DutyTypeProvider } from '../contexts/DutyTypeContext';
import { ShiftProvider } from '../contexts/ShiftContext';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PKRound: require('../assets/fonts/PK Maehongson Round Demo.ttf'),
  });
  
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }
  

  return (
     <ShiftProvider>
        <DutyTypeProvider>
          <DoctorProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
          </DoctorProvider>
        </DutyTypeProvider>
    </ShiftProvider>
  );
}
