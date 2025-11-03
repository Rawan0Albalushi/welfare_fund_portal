import React, { useState } from 'react';
// Buttons/alerts migrated off MUI
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '../types';

export const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: categoriesData, isLoading, refetch } = useCategories({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
  });

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryRequest>({
    defaultValues: {
      name_ar: '',
      name_en: '',
      status: 'active',
    },
  });

  const columns: Column<Category>[] = React.useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      sortable: true,
    },
    {
      id: 'name_ar',
      label: t('categories.category_name') + ' (AR)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'name_en',
      label: t('categories.category_name') + ' (EN)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'status',
      label: t('categories.category_status'),
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'created_at',
      label: t('common.created_at'),
      minWidth: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ], [t]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({
        name_ar: category.name_ar,
        name_en: category.name_en,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      reset({
        name_ar: '',
        name_en: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    reset();
  };

  const handleSubmitForm = async (data: CreateCategoryRequest) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: data as UpdateCategoryRequest,
        });
        setSnackbar({
          open: true,
          message: t('categories.category_updated'),
          severity: 'success',
        });
      } else {
        await createCategoryMutation.mutateAsync(data);
        setSnackbar({
          open: true,
          message: t('categories.category_created'),
          severity: 'success',
        });
      }
      setPage(0);
      handleCloseDialog();
      void refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error occurred',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    
    try {
      await deleteCategoryMutation.mutateAsync(deleteDialog.id);
      setSnackbar({
        open: true,
        message: t('categories.category_deleted'),
        severity: 'success',
      });
      setDeleteDialog(null);
      setPage(0);
      void refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error occurred',
        severity: 'error',
      });
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(direction);
  };

  if (isLoading) {
    return <Loader message="Loading categories..." />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('categories.title')}</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="w-full sm:w-auto h-10 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          + {t('categories.add_category')}
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
      {(categoriesData?.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('categories.no_categories')}
          description="No categories found matching your criteria"
          actionLabel={t('categories.add_category')}
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={categoriesData?.data || []}
          totalCount={categoriesData?.total ?? (categoriesData?.data?.length ?? 0)}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onEdit={(category) => handleOpenDialog(category)}
          onDelete={(category) => setDeleteDialog(category)}
        />
      )}

      {/* Create/Edit Modal (Tailwind) */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseDialog} />
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card p-4">
            <h3 className="text-lg font-semibold mb-2">{editingCategory ? t('categories.edit_category') : t('categories.add_category')}</h3>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
              <div className="space-y-3">
                <Controller
                  name="name_ar"
                  control={control}
                  rules={{ required: 'الاسم بالعربية مطلوب' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1 font-semibold">
                        {t('categories.category_name')} (العربية) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...field}
                        autoFocus
                        className={`w-full h-10 px-3 rounded-md border ${errors.name_ar ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                        placeholder="أدخل اسم الفئة بالعربية"
                        dir="rtl"
                      />
                      {errors.name_ar && (
                        <div className="text-xs text-rose-600 mt-1">{String(errors.name_ar.message)}</div>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="name_en"
                  control={control}
                  rules={{ required: 'English name is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1 font-semibold">
                        {t('categories.category_name')} (English) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...field}
                        className={`w-full h-10 px-3 rounded-md border ${errors.name_en ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                        placeholder="Enter category name in English"
                        dir="ltr"
                      />
                      {errors.name_en && (
                        <div className="text-xs text-rose-600 mt-1">{String(errors.name_en.message)}</div>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1">{t('categories.category_status')}</label>
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
              </div>
              <div className={`flex justify-end gap-2 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button type="button" onClick={handleCloseDialog} className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="h-9 px-3 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDialog}
        title={t('common.delete')}
        message={t('categories.delete_confirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        loading={deleteCategoryMutation.isPending}
        severity="error"
      />

      {/* Snackbar (Tailwind) */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-card border ${snackbar.severity === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{snackbar.message}</div>
              <button className="text-sm opacity-70" onClick={() => setSnackbar({ ...snackbar, open: false })}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
