// no React import needed in TSX with automatic runtime
import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  options?: { value: string | number; label: string }[];
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  helperText?: string;
  error?: boolean;
}

export const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  required = false,
  disabled = false,
  options = [],
  rows = 4,
  fullWidth = true,
  helperText,
  error = false,
}: FormFieldProps<T>) => {

  const renderField = (field: any, fieldState: any) => {
    const hasError = error || !!fieldState.error;
    const errorMessage = fieldState.error?.message;

    switch (type) {
      case 'select':
        return (
          <div className={fullWidth ? 'w-full' : ''}>
            <label className="block text-sm mb-1">
              {label}
              {required && <span className="text-rose-500"> *</span>}
            </label>
            <select
              {...field}
              value={field.value || ''}
              disabled={disabled}
              className={`w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow ${hasError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {(hasError || helperText) && (
              <div className="text-xs mt-1 text-rose-600">{errorMessage || helperText}</div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className={fullWidth ? 'w-full' : ''}>
            <label className="block text-sm mb-1">
              {label}
              {required && <span className="text-rose-500"> *</span>}
            </label>
            <textarea
              {...field}
              rows={rows}
              disabled={disabled}
              className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow ${hasError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
            />
            {(hasError || helperText) && (
              <div className="text-xs mt-1 text-rose-600">{errorMessage || helperText}</div>
            )}
          </div>
        );

      default:
        return (
          <div className={fullWidth ? 'w-full' : ''}>
            <label className="block text-sm mb-1">
              {label}
              {required && <span className="text-rose-500"> *</span>}
            </label>
            <input
              {...field}
              type={type}
              disabled={disabled}
              className={`w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-shadow ${hasError ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
            />
            {(hasError || helperText) && (
              <div className="text-xs mt-1 text-rose-600">{errorMessage || helperText}</div>
            )}
          </div>
        );
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-2">
          {renderField(field, fieldState)}
        </div>
      )}
    />
  );
};
