import { Pressable, StyleSheet, View } from 'react-native';

import { LANGUAGES, t } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

interface LanguageSwitchProps {
  /** 'onPrimary' for the green header banners, 'surface' for normal screens. */
  tone?: 'onPrimary' | 'surface';
}

/** English | Tok Pisin toggle. The choice is saved on the phone. */
export function LanguageSwitch({ tone = 'surface' }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();
  const onPrimary = tone === 'onPrimary';

  return (
    <View
      style={[styles.track, onPrimary ? styles.trackOnPrimary : styles.trackSurface]}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('language.label')}
    >
      {LANGUAGES.map((option) => {
        const selected = option.id === language;
        return (
          <Pressable
            key={option.id}
            onPress={() => setLanguage(option.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            hitSlop={4}
          >
            <AppText
              variant="label"
              color={selected ? 'primary' : onPrimary ? 'textOnPrimary' : 'textSecondary'}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  trackOnPrimary: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  trackSurface: { backgroundColor: colors.surfaceMuted },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  optionSelected: { backgroundColor: colors.surface },
});
