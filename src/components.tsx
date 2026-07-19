import { Feather } from '@expo/vector-icons';
import { useMemo, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName, Pathway } from './data';
import { createShadow, radius, themedAccentColor, themedSoftColor, type, useAppTheme, type AppPalette } from './theme';

const useComponentTheme = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme.palette), [theme.palette]);
  return { ...theme, styles };
};

export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const { palette, styles } = useComponentTheme();
  return (
    <View style={styles.brand} accessibilityLabel="حق‌دان، آموزش حقوق برای فارسی‌زبانان">
      <View style={[styles.brandMark, inverted && styles.brandMarkInverted]}>
        <Feather name="book-open" size={22} color={inverted ? palette.brandSurface : palette.onPrimaryAction} />
      </View>
      {!compact ? (
        <View style={styles.brandCopy}>
          <Text style={[styles.brandFa, inverted && styles.textInverted]}>حق‌دان</Text>
          <Text style={[styles.brandEn, inverted && styles.brandEnInverted]}>HAGHDĀN</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ProgressBar({ value, color, trackColor }: { value: number; color?: string; trackColor?: string }) {
  const { palette, styles } = useComponentTheme();
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor ?? palette.surfaceMuted }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: safeValue }}>
      <View style={[styles.progressValue, { width: (String(safeValue) + '%') as DimensionValue, backgroundColor: color ?? palette.primary }]} />
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  icon = 'arrow-left',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'quiet';
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  const { palette, styles } = useComponentTheme();
  const foreground = variant === 'primary' ? palette.onPrimaryAction : variant === 'secondary' ? palette.primary : palette.inkSoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'quiet' && styles.buttonQuiet,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: foreground }]}>{label}</Text>
      <Feather name={icon} size={18} color={foreground} />
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, dark = false }: { icon: IconName; label: string; onPress: () => void; dark?: boolean }) {
  const { palette, styles } = useComponentTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, dark && styles.iconButtonDark, pressed && styles.pressed]}
    >
      <Feather name={icon} size={21} color={dark ? palette.white : palette.ink} />
    </Pressable>
  );
}

export function Chip({ label, icon, tone = 'neutral' }: { label: string; icon?: IconName; tone?: 'neutral' | 'primary' | 'gold' | 'teal' }) {
  const { palette, styles } = useComponentTheme();
  const tones = {
    neutral: { background: palette.surfaceMuted, foreground: palette.inkSoft },
    primary: { background: palette.primarySoft, foreground: palette.primaryDark },
    gold: { background: palette.saffronSoft, foreground: palette.goldInk },
    teal: { background: palette.tealSoft, foreground: palette.teal },
  } as const;
  const colors = tones[tone];
  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      {icon ? <Feather name={icon} size={14} color={colors.foreground} /> : null}
      <Text style={[styles.chipText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: { label: string; onPress: () => void } }) {
  const { palette, styles } = useComponentTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}>
          <Text style={styles.textActionLabel}>{action.label}</Text>
          <Feather name="arrow-left" size={17} color={palette.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function PathwayCard({ pathway, onPress, wide = false }: { pathway: Pathway; onPress: () => void; wide?: boolean }) {
  const { isDark, styles } = useComponentTheme();
  const softColor = themedSoftColor(pathway.color, pathway.softColor, isDark);
  const accentColor = themedAccentColor(pathway.color, isDark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'مسیر ' + pathway.title + '، ' + pathway.progress + ' درصد تکمیل شده'}
      onPress={onPress}
      style={({ pressed }) => [styles.pathCard, wide && styles.pathCardWide, pressed && styles.cardPressed]}
    >
      <View style={styles.pathTopRow}>
        <View style={[styles.pathIcon, { backgroundColor: softColor }]}>
          <Feather name={pathway.icon} size={23} color={accentColor} />
        </View>
        <Chip label={pathway.level} />
      </View>
      <View style={styles.pathCopy}>
        <Text style={styles.pathTitle}>{pathway.title}</Text>
        <Text style={styles.pathEnglish}>{pathway.englishTitle}</Text>
        <Text style={styles.pathDescription}>{pathway.description}</Text>
      </View>
      <View style={styles.pathFooter}>
        <View style={styles.progressCopy}>
          <Text style={styles.progressPercent}>{pathway.progress > 0 ? String(pathway.progress) + '٪' : 'شروع نشده'}</Text>
          <Text style={styles.lessonCount}>{pathway.lessonsCount} درس</Text>
        </View>
        <ProgressBar value={pathway.progress} color={accentColor} trackColor={softColor} />
      </View>
    </Pressable>
  );
}

export function Surface({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { styles } = useComponentTheme();
  return <View style={[styles.surface, style]}>{children}</View>;
}

const createStyles = (palette: AppPalette) => {
  const shadow = createShadow(palette);
  return StyleSheet.create({
    brand: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
    brandMark: { width: 48, height: 48, borderRadius: 16, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
    brandMarkInverted: { backgroundColor: palette.white },
    brandCopy: { alignItems: 'flex-end' },
    brandFa: { color: palette.ink, fontSize: 22, lineHeight: 27, fontWeight: '800', writingDirection: 'rtl' },
    brandEn: { color: palette.primary, fontFamily: type.latinBold, fontSize: 8, letterSpacing: 2.2, marginTop: 1 },
    brandEnInverted: { color: palette.goldInk },
    textInverted: { color: palette.white },
    progressTrack: { width: '100%', height: 7, borderRadius: radius.round, overflow: 'hidden' },
    progressValue: { height: '100%', borderRadius: radius.round },
    button: { minHeight: 52, paddingHorizontal: 22, borderRadius: radius.md, backgroundColor: palette.primaryAction, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, alignSelf: 'flex-start' },
    buttonSecondary: { backgroundColor: palette.primarySoft, borderWidth: 1, borderColor: palette.secondaryBorder },
    buttonQuiet: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line },
    buttonLabel: { fontSize: 14, lineHeight: 21, fontWeight: '700', writingDirection: 'rtl' },
    fullWidth: { alignSelf: 'stretch', width: '100%' },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.72 },
    iconButton: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
    iconButtonDark: { borderColor: palette.overlayBorder, backgroundColor: palette.overlaySurface },
    chip: { minHeight: 30, paddingHorizontal: 11, borderRadius: radius.round, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start' },
    chipText: { fontSize: 11, lineHeight: 17, fontWeight: '700', writingDirection: 'rtl' },
    sectionHeader: { flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 },
    sectionCopy: { flex: 1, alignItems: 'flex-end' },
    eyebrow: { color: palette.primary, fontSize: 11, lineHeight: 18, fontWeight: '800', letterSpacing: 0.4, textAlign: 'right', writingDirection: 'rtl', marginBottom: 6 },
    sectionTitle: { color: palette.ink, fontSize: 25, lineHeight: 34, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
    textAction: { minHeight: 44, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 4 },
    textActionLabel: { color: palette.primary, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
    pathCard: { flexGrow: 1, flexBasis: 280, minWidth: 260, maxWidth: 520, borderRadius: radius.lg, padding: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, ...shadow },
    pathCardWide: { maxWidth: 1200 },
    cardPressed: { opacity: 0.82, borderColor: palette.pressBorder },
    pathTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    pathIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    pathCopy: { alignItems: 'flex-end', marginTop: 18 },
    pathTitle: { color: palette.ink, fontSize: 18, lineHeight: 27, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
    pathEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 11, letterSpacing: 0.2, marginTop: 3, textAlign: 'right' },
    pathDescription: { color: palette.muted, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl', marginTop: 12 },
    pathFooter: { marginTop: 18, gap: 9 },
    progressCopy: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    progressPercent: { color: palette.inkSoft, fontSize: 11, fontWeight: '700', writingDirection: 'rtl' },
    lessonCount: { color: palette.muted, fontSize: 11, writingDirection: 'rtl' },
    surface: { backgroundColor: palette.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.line, ...shadow },
  });
};