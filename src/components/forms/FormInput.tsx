import type { ComponentProps } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { AppInput } from '@/components/common';

type FormInputProps<T extends FieldValues> = Omit<
  ComponentProps<typeof AppInput>,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: Path<T>;
};

/** Connects an AppInput to react-hook-form, showing the field's validation error. */
export function FormInput<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <AppInput
          {...inputProps}
          ref={ref}
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
