import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common';
import { colors, radius, spacing } from '@/theme';

interface DateFieldProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string;
  /** Latest selectable date, e.g. today for "date completed". */
  maximumDate?: Date;
}

/** Tappable date input. Android uses the system dialog; iOS shows an inline calendar. */
export function DateField({ label, value, onChange, error, maximumDate }: DateFieldProps) {
  const [showIosPicker, setShowIosPicker] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? new Date(),
        mode: 'date',
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(date);
        },
      });
    } else {
      setShowIosPicker((visible) => !visible);
    }
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      <Pressable
        onPress={open}
        style={[styles.field, { borderColor: error ? colors.error : colors.border }]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? format(value, 'd MMMM yyyy') : 'not set'}`}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
        <AppText color={value ? 'textPrimary' : 'textMuted'} style={styles.value}>
          {value ? format(value, 'd MMMM yyyy') : 'Choose a date'}
        </AppText>
      </Pressable>
      {Platform.OS === 'ios' && showIosPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="inline"
          maximumDate={maximumDate}
          onChange={(_event, date) => {
            if (date) onChange(date);
          }}
        />
      )}
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  value: { flex: 1 },
});
