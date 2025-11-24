import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Loader } from '../components/common/Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { studentRegistrationCardService } from '../api/services/studentRegistrationCard';
import { useStudentRegistrationCard, useUpdateStudentRegistrationCard } from '../hooks/useStudentRegistrationCard';
import type { UpdateStudentRegistrationCardRequest } from '../types';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface PreviewCardConfig {
  id: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
  headline: string;
  subtitle: string;
  buttonLabel: string;
}

export const StudentRegistrationCard: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: cardData, isLoading } = useStudentRegistrationCard();
  const updateMutation = useUpdateStudentRegistrationCard();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateStudentRegistrationCardRequest>({
    defaultValues: {
      headline_ar: '',
      headline_en: '',
      subtitle_ar: '',
      subtitle_en: '',
      background: '',
      background_image: '',
      status: 'active',
    },
  });

  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [uploadedBackgroundPath, setUploadedBackgroundPath] = useState<string | null>(null);

  useEffect(() => {
    if (cardData) {
    reset({
      headline_ar: cardData.headline_ar,
      headline_en: cardData.headline_en,
      subtitle_ar: cardData.subtitle_ar ?? '',
      subtitle_en: cardData.subtitle_en ?? '',
      background: cardData.background ?? '',
      background_image: cardData.background_image ?? '',
      background_image_path: cardData.background_image_path ?? uploadedBackgroundPath ?? '',
      status: cardData.status,
    });
    setBackgroundImagePreview(
      cardData.background_image_url ||
        (uploadedBackgroundPath ? studentRegistrationCardService.buildBackgroundImageUrl(uploadedBackgroundPath) : null),
    );
    }
  }, [cardData, reset, uploadedBackgroundPath]);

  const backgroundValue = watch('background');
  const headlineArPreview = watch('headline_ar') || cardData?.headline_ar || t('student_registration_card.preview_headline_ar');
  const headlineEnPreview = watch('headline_en') || cardData?.headline_en || t('student_registration_card.preview_headline_en');
  const subtitleArPreview = watch('subtitle_ar') || cardData?.subtitle_ar || t('student_registration_card.preview_subtitle_ar');
  const subtitleEnPreview = watch('subtitle_en') || cardData?.subtitle_en || t('student_registration_card.preview_subtitle_en');

  const cardStatusLabel = cardData?.status ?? 'active';

  const previewCards = useMemo<PreviewCardConfig[]>(
    () => [
      {
        id: 'en',
        direction: 'ltr',
        headline: headlineEnPreview,
        subtitle: subtitleEnPreview,
        buttonLabel: t('student_registration_card.preview_button_en'),
      },
      {
        id: 'ar',
        direction: 'rtl',
        headline: headlineArPreview,
        subtitle: subtitleArPreview,
        buttonLabel: t('student_registration_card.preview_button_ar'),
      },
    ],
    [headlineEnPreview, headlineArPreview, subtitleEnPreview, subtitleArPreview, t],
  );

  const hexToRgba = (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const extractColorsFromBackground = (value?: string | Record<string, any> | null): { from: string; to: string; angle: string } | null => {
    if (!value) {
      return null;
    }

    const parseFromObject = (obj: Record<string, any>) => {
      if (obj?.type === 'gradient') {
        const from = obj.color_from || obj.from || '#2563eb';
        const to = obj.color_to || obj.to || '#9333ea';
        const angle = obj.angle || '135deg';
        return { from, to, angle };
      }
      if (obj?.type === 'color' || obj?.color) {
        const color = obj.color || obj.value || '#2563eb';
        return { from: color, to: color, angle: '135deg' };
      }
      return null;
    };

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parseFromObject(parsed);
        }
      } catch {
        // not JSON; check if it's a gradient string
        if (trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient')) {
          // Try to extract colors from gradient string
          const colorMatch = trimmed.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g);
          if (colorMatch && colorMatch.length >= 2) {
            return { from: colorMatch[0], to: colorMatch[1], angle: '135deg' };
          } else if (colorMatch && colorMatch.length === 1) {
            return { from: colorMatch[0], to: colorMatch[0], angle: '135deg' };
          }
        } else if (trimmed.match(/^#[a-fA-F0-9]{6}$|^#[a-fA-F0-9]{3}$/i)) {
          // Single color
          return { from: trimmed, to: trimmed, angle: '135deg' };
        }
      }

      return null;
    }

    if (typeof value === 'object') {
      return parseFromObject(value);
    }

    return null;
  };

  const resolveBackgroundGradient = (value?: string | Record<string, any> | null): string => {
    if (!value) {
      return '';
    }

    const parseFromObject = (obj: Record<string, any>) => {
      if (obj?.type === 'gradient') {
        const from = obj.color_from || obj.from || '#2563eb';
        const to = obj.color_to || obj.to || '#9333ea';
        const angle = obj.angle || '135deg';
        return `linear-gradient(${angle}, ${from}, ${to})`;
      }
      if (obj?.type === 'color' || obj?.color) {
        return obj.color || obj.value || '';
      }
      return '';
    };

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          return parseFromObject(parsed) || trimmed;
        }
      } catch {
        // not JSON; fall through
      }

      return trimmed;
    }

    if (typeof value === 'object') {
      return parseFromObject(value) || '';
    }

    return '';
  };

  const buildCardStyle = (variant: 'en' | 'ar'): React.CSSProperties => {
    const fallbackGradient =
      variant === 'en'
        ? 'linear-gradient(135deg, #ec4899, #a855f7)'
        : 'linear-gradient(135deg, #2563eb, #9333ea)';
    const resolvedBackground = resolveBackgroundGradient(backgroundValue) || fallbackGradient;
    const isGradient = resolvedBackground.startsWith('linear-gradient') || resolvedBackground.startsWith('radial-gradient');
    
    // Extract colors from user's background for overlay
    const extractedColors = extractColorsFromBackground(backgroundValue);
    let overlayImage: string | undefined;
    
    if (backgroundImagePreview) {
      if (extractedColors) {
        const fromRgba = hexToRgba(extractedColors.from, 0.35);
        const toRgba = hexToRgba(extractedColors.to, 0.15);
        overlayImage = `linear-gradient(${extractedColors.angle}, ${fromRgba}, ${toRgba}), url(${backgroundImagePreview})`;
      } else {
        // Fallback to default overlay if colors can't be extracted
        overlayImage = `linear-gradient(135deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.15)), url(${backgroundImagePreview})`;
      }
    }

    const style: React.CSSProperties = {
      borderRadius: '1.8rem',
      minHeight: 220,
      padding: '1.4rem',
      boxShadow: '0 20px 35px rgba(15, 23, 42, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };

    if (overlayImage) {
      style.backgroundImage = overlayImage;
    } else if (isGradient) {
      style.backgroundImage = resolvedBackground;
    } else {
      style.backgroundColor = resolvedBackground;
    }

    return style;
  };

  const onSubmit = async (values: UpdateStudentRegistrationCardRequest) => {
    try {
      await updateMutation.mutateAsync(values);
      setSnackbar({
        open: true,
        message: t('student_registration_card.updated_success'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('student_registration_card.update_failed'),
        severity: 'error',
      });
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBackground(true);
      const path = await studentRegistrationCardService.uploadBackground(file);
      setValue('background_image', path);
      setValue('background_image_path', path);
      setUploadedBackgroundPath(path);
      setBackgroundImagePreview(studentRegistrationCardService.buildBackgroundImageUrl(path));
      // Auto-save the new background image path so the backend stores it immediately.
      await updateMutation.mutateAsync({
        background_image: path,
      });
      setSnackbar({
        open: true,
        message: t('student_registration_card.background_uploaded'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('student_registration_card.background_upload_failed'),
        severity: 'error',
      });
    } finally {
      setUploadingBackground(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  if (isLoading || !cardData) {
    return <Loader message={t('common.loading')} />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <header className="space-y-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-black text-transparent bg-clip-text">
            {t('student_registration_card.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {t('student_registration_card.description')}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
        {/* Preview Column */}
        <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {t('student_registration_card.preview_tagline')}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('student_registration_card.preview_section_title')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {previewCards.map((previewCard) => (
                <div
                  key={previewCard.id}
                  className="flex h-full flex-col items-center justify-center text-white text-center"
                  dir={previewCard.direction}
                  style={buildCardStyle(previewCard.id)}
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold leading-tight">{previewCard.headline}</h3>
                    <p className="text-sm text-white/80">{previewCard.subtitle}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 shadow-md shadow-black/10 transition hover:bg-gray-50 hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm">{previewCard.buttonLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Form Column */}
        <article className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-6 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
            <input type="hidden" {...register('background_image')} />
            <input type="hidden" {...register('background_image_path')} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.headline_ar')}
                </label>
                <input
                  {...register('headline_ar', { required: t('student_registration_card.headline_ar_required') })}
                  className={`mt-1 w-full h-11 rounded-2xl border px-3 text-sm transition ${
                    errors.headline_ar ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
                  }`}
                  dir="rtl"
                />
                {errors.headline_ar && (
                  <p className="text-xs text-rose-600 mt-1">{String(errors.headline_ar.message)}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.headline_en')}
                </label>
                <input
                  {...register('headline_en', { required: t('student_registration_card.headline_en_required') })}
                  className={`mt-1 w-full h-11 rounded-2xl border px-3 text-sm transition ${
                    errors.headline_en ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
                  }`}
                  dir="ltr"
                />
                {errors.headline_en && (
                  <p className="text-xs text-rose-600 mt-1">{String(errors.headline_en.message)}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.subtitle_ar')}
                </label>
                <textarea
                  {...register('subtitle_ar')}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 transition"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.subtitle_en')}
                </label>
                <textarea
                  {...register('subtitle_en')}
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 transition"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.background_field')}
                </label>
                <input
                  {...register('background')}
                  placeholder={t('student_registration_card.background_placeholder')}
                  className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:border-primary-500 transition"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {t('student_registration_card.background_helper')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.upload_background')}
                </label>
                <label
                  className={`mt-1 flex items-center justify-center h-11 rounded-2xl border border-dashed px-3 text-sm font-semibold transition ${
                    uploadingBackground ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-500 hover:border-primary-500 hover:text-primary-700'
                  }`}
                >
                  {t('student_registration_card.upload_button')}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleBackgroundUpload}
                    disabled={uploadingBackground}
                  />
                </label>
                {uploadingBackground && (
                  <p className="text-xs text-primary-600 mt-1">{t('student_registration_card.uploading')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('student_registration_card.status')}
                </label>
                <select
                  {...register('status')}
                  className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm focus:border-primary-500 transition"
                >
                  <option value="active">{t('student_registration_card.status_active')}</option>
                  <option value="inactive">{t('student_registration_card.status_inactive')}</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full lg:w-auto h-11 px-6 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold transition disabled:opacity-60"
                >
                  {updateMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </form>
        </article>
      </section>

      {snackbar.open && (
        <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50 animate-fade-in`}>
          <div
            className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-lg border ${
              snackbar.severity === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{snackbar.message}</div>
              <button
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

