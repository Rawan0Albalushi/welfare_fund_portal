const ENGLISH_NUMBER_LOCALE = 'en-US';
const ENGLISH_CURRENCY_LOCALE = 'en-OM';

type DateInput = Date | string | number | null | undefined;

const normalizeDateInput = (value: DateInput): Date | null => {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeNumberInput = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const formatEnglishNumber = (
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
  locale: string = ENGLISH_NUMBER_LOCALE
): string => {
  const numericValue = normalizeNumberInput(value);
  if (numericValue === null) return '';
  return new Intl.NumberFormat(locale, options).format(numericValue);
};

export const formatEnglishCurrency = (
  value: number | string | null | undefined,
  currency: string = 'OMR',
  options?: Intl.NumberFormatOptions
): string => {
  const numericValue = normalizeNumberInput(value);
  if (numericValue === null) return '';
  return new Intl.NumberFormat(
    ENGLISH_CURRENCY_LOCALE,
    { style: 'currency', currency, ...(options ?? {}) }
  ).format(numericValue);
};

export const formatEnglishDate = (
  value: DateInput,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = normalizeDateInput(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(ENGLISH_NUMBER_LOCALE, options).format(date);
};

export const formatEnglishDateTime = (
  value: DateInput,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = normalizeDateInput(value);
  if (!date) return '';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Intl.DateTimeFormat(
    ENGLISH_NUMBER_LOCALE,
    options ? { ...defaultOptions, ...options } : defaultOptions
  ).format(date);
};


