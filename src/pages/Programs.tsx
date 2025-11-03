import React, { useState } from 'react';
// Buttons/alerts migrated off MUI
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram } from '../hooks/usePrograms';
import { useCategories } from '../hooks/useCategories';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Program, type CreateProgramRequest, type UpdateProgramRequest } from '../types';

export const Programs: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  // Removed category filter per simplified program model
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Program | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: programsData, isLoading } = usePrograms({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
  });

  const { data: categoriesData } = useCategories({ per_page: 100 });

  const createProgramMutation = useCreateProgram();
  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProgramRequest>({
    defaultValues: {
      category_id: 0,
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      status: 'active',
    },
  });

  const columns: Column<Program>[] = React.useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      sortable: true,
    },
    {
      id: 'title_ar',
      label: t('programs.program_title') + ' (AR)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'title_en',
      label: t('programs.program_title') + ' (EN)',
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'status',
      label: t('programs.program_status'),
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

  const handleOpenDialog = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      reset({
        category_id: program.category_id,
        title_ar: program.title_ar,
        title_en: program.title_en,
        description_ar: program.description_ar || '',
        description_en: program.description_en || '',
        status: program.status,
      });
    } else {
      setEditingProgram(null);
      reset({
        category_id: 0,
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProgram(null);
    reset();
  };

  const handleSubmitForm = async (data: CreateProgramRequest) => {
    try {
      if (editingProgram) {
        await updateProgramMutation.mutateAsync({
          id: editingProgram.id,
          data: data as UpdateProgramRequest,
        });
        setSnackbar({
          open: true,
          message: t('programs.program_updated'),
          severity: 'success',
        });
      } else {
        await createProgramMutation.mutateAsync(data);
        setSnackbar({
          open: true,
          message: t('programs.program_created'),
          severity: 'success',
        });
      }
      handleCloseDialog();
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
      await deleteProgramMutation.mutateAsync(deleteDialog.id);
      setSnackbar({
        open: true,
        message: t('programs.program_deleted'),
        severity: 'success',
      });
      setDeleteDialog(null);
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
    return <Loader message="Loading programs..." />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('programs.title')}</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="w-full sm:w-auto h-10 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          + {t('programs.add_program')}
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
      {programsData?.data?.length === 0 ? (
        <EmptyState
          title={t('programs.no_programs')}
          description="No programs found matching your criteria"
          actionLabel={t('programs.add_program')}
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={programsData?.data || []}
          totalCount={programsData?.total ?? (programsData?.data?.length ?? 0)}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onEdit={(program) => handleOpenDialog(program)}
          onDelete={(program) => setDeleteDialog(program)}
        />
      )}

      {/* Create/Edit Modal (Tailwind) */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseDialog} />
          <div className="relative w-full max-w-2xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card p-4">
            <h3 className="text-lg font-semibold mb-2">{editingProgram ? t('programs.edit_program') : t('programs.add_program')}</h3>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
              <div className="flex flex-col gap-4">
                {/* Category Selection */}
                <Controller
                  name="category_id"
                  control={control}
                  rules={{ required: 'الفئة مطلوبة', min: { value: 1, message: 'يرجى اختيار فئة' } }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1 font-semibold">
                        الفئة <span className="text-rose-500">*</span>
                      </label>
                      <select
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className={`w-full h-10 px-3 rounded-md border ${errors.category_id ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                      >
                        <option value="0">اختر الفئة</option>
                        {(categoriesData?.data || []).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name_ar} - {cat.name_en}</option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <div className="text-xs text-rose-600 mt-1">{String(errors.category_id.message)}</div>
                      )}
                    </div>
                  )}
                />

                {/* Titles - Arabic & English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="title_ar"
                    control={control}
                    rules={{ required: 'العنوان بالعربية مطلوب' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm mb-1 font-semibold">
                          العنوان (العربية) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...field}
                          autoFocus
                          className={`w-full h-10 px-3 rounded-md border ${errors.title_ar ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                          placeholder="أدخل عنوان البرنامج بالعربية"
                          dir="rtl"
                        />
                        {errors.title_ar && (
                          <div className="text-xs text-rose-600 mt-1">{String(errors.title_ar.message)}</div>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="title_en"
                    control={control}
                    rules={{ required: 'English title is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm mb-1 font-semibold">
                          Title (English) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...field}
                          className={`w-full h-10 px-3 rounded-md border ${errors.title_en ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                          placeholder="Enter program title in English"
                          dir="ltr"
                        />
                        {errors.title_en && (
                          <div className="text-xs text-rose-600 mt-1">{String(errors.title_en.message)}</div>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Descriptions - Arabic & English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="description_ar"
                    control={control}
                    rules={{ required: 'الوصف بالعربية مطلوب' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm mb-1 font-semibold">
                          الوصف (العربية) <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          {...field}
                          rows={3}
                          className={`w-full px-3 py-2 rounded-md border ${errors.description_ar ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                          placeholder="أدخل وصف البرنامج بالعربية"
                          dir="rtl"
                        />
                        {errors.description_ar && (
                          <div className="text-xs text-rose-600 mt-1">{String(errors.description_ar.message)}</div>
                        )}
                      </div>
                    )}
                  />
                  
                  <Controller
                    name="description_en"
                    control={control}
                    rules={{ required: 'English description is required' }}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm mb-1 font-semibold">
                          Description (English) <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          {...field}
                          rows={3}
                          className={`w-full px-3 py-2 rounded-md border ${errors.description_en ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                          placeholder="Enter program description in English"
                          dir="ltr"
                        />
                        {errors.description_en && (
                          <div className="text-xs text-rose-600 mt-1">{String(errors.description_en.message)}</div>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Status */}
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1 font-semibold">{t('programs.program_status')}</label>
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

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleCloseDialog} className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
                  className="h-9 px-3 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {createProgramMutation.isPending || updateProgramMutation.isPending ? t('common.loading') : t('common.save')}
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
        message={t('programs.delete_confirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        loading={deleteProgramMutation.isPending}
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
