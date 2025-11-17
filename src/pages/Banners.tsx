import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '../hooks/useBanners';
import { bannersService } from '../api/services/banners';
import { type Banner, type CreateBannerRequest, type UpdateBannerRequest } from '../types';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const Banners: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Banner | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: bannersData, isLoading, refetch } = useBanners({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
  });

  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateBannerRequest>({
    defaultValues: {
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      image: '',
      link: '',
      status: 'active',
      order: 0,
      start_date: '',
      end_date: '',
    },
  });

  const columns: Column<Banner>[] = React.useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      sortable: true,
    },
    {
      id: 'image_url',
      label: t('banners.image'),
      minWidth: 120,
      sortable: false,
      render: (_value, row) => {
        const imageUrl = row.image_url || row.image;
        if (!imageUrl) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center justify-center">
            <img
              src={imageUrl}
              alt={row.title_ar || row.title_en}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );
      },
    },
    {
      id: 'title_ar',
      label: t('banners.title') + ' (AR)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'title_en',
      label: t('banners.title') + ' (EN)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'link',
      label: t('banners.link'),
      minWidth: 200,
      sortable: false,
      render: (value) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate block max-w-xs">
          {value}
        </a>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      id: 'status',
      label: t('banners.status'),
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'order',
      label: t('banners.order'),
      minWidth: 100,
      sortable: true,
    },
    {
      id: 'created_at',
      label: t('common.created_at'),
      minWidth: 150,
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ], [t]);

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      // Use image (which contains the path) for form, and image_url for preview
      const imagePath = banner.image || ''; // This is the path from mapApiBannerToUi
      const imageUrl = banner.image_url || banner.image; // Full URL for preview
      reset({
        title_ar: banner.title_ar,
        title_en: banner.title_en,
        description_ar: banner.description_ar || '',
        description_en: banner.description_en || '',
        image: imagePath, // Store path for editing (will be sent as image_path)
        link: banner.link || '',
        status: banner.status,
        order: banner.order || 0,
        start_date: banner.start_date || '',
        end_date: banner.end_date || '',
      });
      setImagePreview(imageUrl || null);
    } else {
      setEditingBanner(null);
      reset({
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        image: '',
        link: '',
        status: 'active',
        order: 0,
        start_date: '',
        end_date: '',
      });
      setImagePreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBanner(null);
    reset();
    setImagePreview(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      setUploadingImage(true);
      const imageUrl = await bannersService.uploadImage(file);
      setValue('image', imageUrl);
      setSnackbar({
        open: true,
        message: t('banners.image_uploaded'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || t('banners.image_upload_failed'),
        severity: 'error',
      });
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitForm = async (data: CreateBannerRequest) => {
    try {
      // Validate image is provided
      if (!data.image || data.image.trim() === '') {
        setSnackbar({
          open: true,
          message: t('banners.image_required'),
          severity: 'error',
        });
        return;
      }

      if (editingBanner) {
        await updateBannerMutation.mutateAsync({
          id: editingBanner.id,
          data: data as UpdateBannerRequest,
        });
        setSnackbar({
          open: true,
          message: t('banners.banner_updated'),
          severity: 'success',
        });
      } else {
        await createBannerMutation.mutateAsync(data);
        setSnackbar({
          open: true,
          message: t('banners.banner_created'),
          severity: 'success',
        });
      }
      handleCloseDialog();
      // Reset to first page and refetch
      setPage(0);
      // Wait a bit for the mutation to complete, then refetch
      setTimeout(() => {
        void refetch();
      }, 100);
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = t('banners.error_occurred');
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Format validation errors
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          const errorList = Object.entries(errors)
            .map(([key, value]) => {
              const val = Array.isArray(value) ? value[0] : value;
              return `${key}: ${val}`;
            })
            .join(', ');
          errorMessage = errorList || JSON.stringify(errors);
        } else {
          errorMessage = String(errors);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    
    try {
      await deleteBannerMutation.mutateAsync(deleteDialog.id);
      setSnackbar({
        open: true,
        message: t('banners.banner_deleted'),
        severity: 'success',
      });
      setDeleteDialog(null);
      setPage(0);
      void refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('banners.error_occurred'),
        severity: 'error',
      });
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(direction);
  };

  if (isLoading) {
    return <Loader message={t('common.loading')} />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('banners.title')}</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="w-full sm:w-auto h-10 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          + {t('banners.add_banner')}
        </button>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('common.search')}
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder={t('common.search') || 'Search...'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('common.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="">{t('common.all_statuses')}</option>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="w-full h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
              >
                {t('common.clear_filters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {(bannersData?.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('banners.no_banners')}
          description={t('banners.no_banners_description')}
          actionLabel={t('banners.add_banner')}
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={bannersData?.data || []}
          totalCount={
            (typeof bannersData?.total === 'number' && bannersData.total > 0)
              ? bannersData.total
              : ((bannersData?.last_page && bannersData?.per_page)
                  ? bannersData.last_page * bannersData.per_page
                  : (bannersData?.data?.length ?? 0))
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onEdit={(banner) => handleOpenDialog(banner)}
          onDelete={(banner) => setDeleteDialog(banner)}
        />
      )}

      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingBanner ? (t('banners.edit_banner') || '') : (t('banners.add_banner') || '')}
        size="lg"
        footer={
          <div className={`flex justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={handleCloseDialog}
              className="h-9 px-4 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              form="banner-form"
              disabled={createBannerMutation.isPending || updateBannerMutation.isPending || uploadingImage}
              className="h-9 px-4 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createBannerMutation.isPending || updateBannerMutation.isPending
                ? t('common.loading')
                : t('common.save')}
            </button>
          </div>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit(handleSubmitForm)} className="p-1 space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('banners.image')} <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300"
                />
                {uploadingImage && (
                  <p className="text-sm text-primary-600 mt-2">{t('banners.uploading')}...</p>
                )}
              </div>
              {(imagePreview || watch('image')) && (
                <div className="flex-shrink-0">
                  <img
                    src={imagePreview || watch('image') || ''}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-xs text-rose-600 mt-1">{String(errors.image.message)}</p>
            )}
          </div>

          {/* Title AR */}
          <Controller
            name="title_ar"
            control={control}
            rules={{ required: t('banners.title_ar_required') }}
            render={({ field }) => (
              <div>
                <label className="block text-sm mb-1 font-semibold">
                  {t('banners.title')} (العربية) <span className="text-rose-500">*</span>
                </label>
                <input
                  {...field}
                  className={`w-full h-10 px-3 rounded-md border ${errors.title_ar ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                  placeholder={t('banners.title_ar_placeholder')}
                  dir="rtl"
                />
                {errors.title_ar && (
                  <p className="text-xs text-rose-600 mt-1">{String(errors.title_ar.message)}</p>
                )}
              </div>
            )}
          />

          {/* Title EN */}
          <Controller
            name="title_en"
            control={control}
            rules={{ required: t('banners.title_en_required') }}
            render={({ field }) => (
              <div>
                <label className="block text-sm mb-1 font-semibold">
                  {t('banners.title')} (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  {...field}
                  className={`w-full h-10 px-3 rounded-md border ${errors.title_en ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                  placeholder={t('banners.title_en_placeholder')}
                  dir="ltr"
                />
                {errors.title_en && (
                  <p className="text-xs text-rose-600 mt-1">{String(errors.title_en.message)}</p>
                )}
              </div>
            )}
          />

          {/* Description AR */}
          <Controller
            name="description_ar"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm mb-1 font-semibold">
                  {t('banners.description')} (العربية)
                </label>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder={t('banners.description_ar_placeholder')}
                  dir="rtl"
                />
              </div>
            )}
          />

          {/* Description EN */}
          <Controller
            name="description_en"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm mb-1 font-semibold">
                  {t('banners.description')} (English)
                </label>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder={t('banners.description_en_placeholder')}
                  dir="ltr"
                />
              </div>
            )}
          />

          {/* Link */}
          <Controller
            name="link"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm mb-1 font-semibold">
                  {t('banners.link')}
                </label>
                <input
                  {...field}
                  type="url"
                  className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  placeholder="https://example.com"
                  dir="ltr"
                />
              </div>
            )}
          />

          {/* Status and Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm mb-1 font-semibold">
                    {t('banners.status')}
                  </label>
                  <select
                    {...field}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <option value="active">{t('common.active')}</option>
                    <option value="inactive">{t('common.inactive')}</option>
                  </select>
                </div>
              )}
            />

            <Controller
              name="order"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm mb-1 font-semibold">
                    {t('banners.order')}
                  </label>
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </div>
              )}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm mb-1 font-semibold">
                    {t('banners.start_date')}
                  </label>
                  <input
                    {...field}
                    type="date"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              )}
            />

            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm mb-1 font-semibold">
                    {t('banners.end_date')}
                  </label>
                  <input
                    {...field}
                    type="date"
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              )}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDialog}
        title={t('common.delete')}
        message={t('banners.delete_confirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        loading={deleteBannerMutation.isPending}
        severity="error"
      />

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50 animate-fade-in`}>
          <div className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-card border ${
            snackbar.severity === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{snackbar.message}</div>
              <button
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setSnackbar({ ...snackbar, open: false })}
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

