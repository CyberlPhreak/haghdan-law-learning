import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { ThemeMode } from './store';

export type AppPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  primary: string;
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
  shadow: string;
};

export const lightPalette: AppPalette = {
  background: '#F7F6FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F0EEF9',
  ink: '#19172B',
  inkSoft: '#3E3A55',
  muted: '#716D84',
  line: '#E3E0EE',
  primary: '#4B3DB8',
  primaryDark: '#2F267A',
  primarySoft: '#ECE9FF',
  brandSurface: '#2F267A',
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
  pressBorder: '#CFC9ED',
  secondaryBorder: '#D6D0FF',
  overlayBorder: 'rgba(255,255,255,0.18)',
  overlaySurface: 'rgba(255,255,255,0.08)',
  shadow: '#2F267A',
};

export const darkPalette: AppPalette = {
  background: '#0B1020',
  surface: '#131A2C',
  surfaceMuted: '#1B2438',
  ink: '#F7F5FF',
  inkSoft: '#D9D5E8',
  muted: '#AAA5BA',
  line: '#33405A',
  primary: '#A99DFF',
  primaryDark: '#CEC8FF',
  primarySoft: '#29264B',
  brandSurface: '#211C4D',
  teal: '#69DDD1',
  tealSoft: '#153B3B',
  saffron: '#F3C660',
  saffronSoft: '#493A1D',
  rose: '#FF91A8',
  roseSoft: '#4B2432',
  success: '#59D5B1',
  white: '#FFFFFF',
  black: '#070A12',
  onPrimaryMuted: '#D8D2FF',
  goldInk: '#FFE39A',
  goldBody: '#F8D985',
  tealInk: '#B9F8F0',
  borderGold: '#755E27',
  borderRose: '#77384A',
  pressBorder: '#7369A7',
  secondaryBorder: '#5B5292',
  overlayBorder: 'rgba(255,255,255,0.22)',
  overlaySurface: 'rgba(255,255,255,0.10)',
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

export const createShadow = (colors: AppPalette) => ({
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: colors === darkPalette ? 0.28 : 0.09,
  shadowRadius: 24,
  elevation: 5,
});

export const shadow = createShadow(lightPalette);