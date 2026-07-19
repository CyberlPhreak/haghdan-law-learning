import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HaghDanApp } from './src/navigation';
import { LearnerProvider, useLearner } from './src/store';
import { AppThemeProvider, darkPalette, lightPalette, useAppTheme } from './src/theme';

function ThemedApplication() {
  const { state } = useLearner();
  return (
    <AppThemeProvider mode={state.themeMode}>
      <ApplicationChrome />
    </AppThemeProvider>
  );
}

function ApplicationChrome() {
  const { isDark, palette } = useAppTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={palette.background} />
      <HaghDanApp />
    </>
  );
}

export default function App() {
  const systemScheme = useColorScheme();
  const startupPalette = systemScheme === 'dark' ? darkPalette : lightPalette;
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={[styles.loading, { backgroundColor: startupPalette.background }]}><ActivityIndicator size="large" color={startupPalette.primary} /></View>;
  }

  return (
    <SafeAreaProvider>
      <LearnerProvider>
        <ThemedApplication />
      </LearnerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});