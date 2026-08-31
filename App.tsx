import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from '@expo-google-fonts/manrope/useFonts';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HaghDanApp } from './src/navigation';
import { I18nProvider } from './src/i18n';
import { SoundProvider } from './src/sound';
import { LearnerProvider, useLearner } from './src/store';
import { AppThemeProvider, darkPalette, lightPalette, useAppTheme } from './src/theme';

function ThemedApplication() {
  const { state } = useLearner();
  return (
    <I18nProvider language={state.language}>
      <AppThemeProvider mode={state.themeMode}>
        <SoundProvider>
          <ApplicationChrome />
        </SoundProvider>
      </AppThemeProvider>
    </I18nProvider>
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
