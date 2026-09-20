import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import type { ThemeMode } from './store';

export type AppPalette = {
  background: string;
  sectionHome: string;
  sectionLearn: string;
  sectionReview: string;
  sectionPractice: string;
  sectionProfile: string;
  surface: string;
  surfaceMuted: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  primary: string;
  primaryAction: string;
  onPrimaryAction: string;
  primaryDark: string;
  primarySoft: string;
  brandSurface: string;
  teal: string;
  tealSoft: string;
  saffron: string;
  saffronSoft: string;
  rose: string;
  roseSoft: string;
  success: string;
  white: string;
  black: string;
  onPrimaryMuted: string;
  goldInk: string;
  goldBody: string;
  tealInk: string;
  borderGold: string;
  borderRose: string;
  pressBorder: string;
  secondaryBorder: string;
  overlayBorder: string;
  overlaySurface: string;
  imageScrim: string;
  imageScrimStrong: string;
  ambientPrimary: string;
  ambientSecondary: string;
  ambientWarm: string;
  accentGlow: string;
  shadow: string;
};

export const lightPalette: AppPalette = {
  background: '#F4F5F9',
  sectionHome: '#F4F5F9',
  sectionLearn: '#F0EFF9',
  sectionReview: '#ECF6F3',
  sectionPractice: '#EDF3FA',
  sectionProfile: '#F7F0EA',
  surface: '#FFFEFC',
  surfaceMuted: '#F0F2F8',
  ink: '#171A2B',
  inkSoft: '#3C415A',
  muted: '#737A91',
  line: '#E0E4ED',
  primary: '#453FA4',
  primaryAction: '#5148D2',
  onPrimaryAction: '#FFFFFF',
  primaryDark: '#302A7A',
  primarySoft: '#ECEBFB',
  brandSurface: '#29245F',
  teal: '#087F78',
  tealSoft: '#DDF4F0',
  saffron: '#E2A11D',
  saffronSoft: '#FFF1C8',
  rose: '#B33C58',
  roseSoft: '#FCE8ED',
  success: '#16705B',
  white: '#FFFFFF',
  black: '#0C0B12',
  onPrimaryMuted: '#D7D1FF',
  goldInk: '#6E4900',
  goldBody: '#5C430D',
  tealInk: '#195C57',
  borderGold: '#E9CC80',
  borderRose: '#F1C4D0',
  pressBorder: '#C9C8E9',
  secondaryBorder: '#D3D0F3',
  overlayBorder: 'rgba(255,255,255,0.18)',
  overlaySurface: 'rgba(255,255,255,0.08)',
  imageScrim: 'rgba(255,255,255,0.08)',
  imageScrimStrong: 'rgba(8,12,28,0.70)',
  ambientPrimary: 'rgba(81,72,210,0.045)',
  ambientSecondary: 'rgba(8,127,120,0.04)',
  ambientWarm: 'rgba(226,161,29,0.035)',
  accentGlow: 'rgba(81,72,210,0.14)',
  shadow: '#25215A',
};

export const darkPalette: AppPalette = {
  background: '#0B1020',
  sectionHome: '#0B1020',
  sectionLearn: '#17112D',
  sectionReview: '#082224',
  sectionPractice: '#091B33',
  sectionProfile: '#24151F',
  surface: '#121A2D',
  surfaceMuted: '#19243A',
  ink: '#F6F7FF',
  inkSoft: '#D8DEF4',
  muted: '#A6B0CC',
  line: '#293653',
  primary: '#B7A8FF',
  primaryAction: '#7058F5',
  onPrimaryAction: '#FFFFFF',
  primaryDark: '#E0DAFF',
  primarySoft: '#29264F',
  brandSurface: '#211C4A',
  teal: '#52E4D1',
  tealSoft: '#123B3B',
  saffron: '#FFD166',
  saffronSoft: '#48371B',
  rose: '#FF83A6',
  roseSoft: '#492033',
  success: '#4ADDB2',
  white: '#FFFFFF',
  black: '#040610',
  onPrimaryMuted: '#DED9FF',
  goldInk: '#FFE7A3',
  goldBody: '#EBCF80',
  tealInk: '#B4FAF0',
  borderGold: '#765D2D',
  borderRose: '#74344D',
  pressBorder: '#8172C5',
  secondaryBorder: '#574AA0',
  overlayBorder: 'rgba(255,255,255,0.15)',
  overlaySurface: 'rgba(255,255,255,0.075)',
  imageScrim: 'rgba(3,5,14,0.12)',
  imageScrimStrong: 'rgba(3,5,14,0.68)',
  ambientPrimary: 'rgba(112,88,245,0.18)',
  ambientSecondary: 'rgba(82,228,209,0.10)',
  ambientWarm: 'rgba(255,209,102,0.07)',
  accentGlow: 'rgba(112,88,245,0.34)',
  shadow: '#000000',
};

export const palette = lightPalette;

type ThemeValue = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  isDark: boolean;
  palette: AppPalette;
};

const ThemeContext = createContext<ThemeValue>({
  mode: 'system',
  scheme: 'light',
  isDark: false,
  palette: lightPalette,
});

export function AppThemeProvider({ mode, children }: { mode: ThemeMode; children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo<ThemeValue>(() => ({
    mode,
    scheme,
    isDark: scheme === 'dark',
    palette: scheme === 'dark' ? darkPalette : lightPalette,
  }), [mode, scheme]);
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

const mix = (first: string, second: string, weight: number) => {
  const parse = (value: string) => value.replace('#', '').match(/.{2}/g)?.map(part => Number.parseInt(part, 16)) ?? [0, 0, 0];
  const a = parse(first);
  const b = parse(second);
  const channel = (index: number) => Math.round(a[index]! * (1 - weight) + b[index]! * weight).toString(16).padStart(2, '0');
  return '#' + channel(0) + channel(1) + channel(2);
};

export const themedSoftColor = (color: string, softColor: string, isDark: boolean) =>
  isDark ? mix(color, darkPalette.surface, 0.72) : softColor;

export const themedAccentColor = (color: string, isDark: boolean) =>
  isDark ? mix(color, '#FFFFFF', 0.48) : color;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  round: 999,
};

export const type = {
  latinRegular: 'Manrope_400Regular',
  latinMedium: 'Manrope_500Medium',
  latinSemibold: 'Manrope_600SemiBold',
  latinBold: 'Manrope_700Bold',
};

export const createShadow = (colors: AppPalette) => Platform.OS === 'web'
  ? { boxShadow: colors === darkPalette ? '0 14px 34px rgba(0,0,0,0.34), 0 1px 0 rgba(255,255,255,0.035)' : '0 12px 24px rgba(47,38,122,0.09)' }
  : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: colors === darkPalette ? 0.34 : 0.09,
      shadowRadius: colors === darkPalette ? 28 : 24,
      elevation: colors === darkPalette ? 7 : 5,
    };

export const createAccentGlow = (colors: AppPalette) => Platform.OS === 'web'
  ? { boxShadow: `0 10px 28px ${colors.accentGlow}` }
  : {
      shadowColor: colors.primaryAction,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: colors === darkPalette ? 0.34 : 0.14,
      shadowRadius: 18,
      elevation: colors === darkPalette ? 6 : 3,
    };

export const shadow = createShadow(lightPalette);
