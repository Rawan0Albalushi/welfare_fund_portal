import React, { useState } from 'react';
// Buttons/alerts migrated off MUI
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '../types';

export const Categories: React.FC = () => {
  const { t } = useTranslation();
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

  const { data: categoriesData, isLoading } = useCategories({
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
      name: '',
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
      id: 'name',
      label: t('categories.category_name'),
      minWidth: 200,
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
        name: category.name,
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      reset({
        name: '',
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
      await deleteCategoryMutation.mutateAsync(deleteDialog.id);
      setSnackbar({
        open: true,
        message: t('categories.category_deleted'),
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
    return <Loader message="Loading categories..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="h-10 px-4 rounded-lg text-white bg-primary-600 hover:bg-primary-700"
        >
          + {t('categories.add_category')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-sm mb-1">{t('common.search')}</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] h-10 px-3 rounded-lg border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            placeholder={t('common.search') || 'Search'}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('common.status')}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] h-10 px-3 rounded-lg border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="">All</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {categoriesData?.data.length === 0 ? (
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
          totalCount={categoriesData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
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
                  name="name"
                  control={control}
                  rules={{ required: t('categories.category_name') + ' is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1">{t('categories.category_name')}</label>
                      <input
                        {...field}
                        autoFocus
                        className={`w-full h-10 px-3 rounded-md border ${errors.name ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                        placeholder={t('categories.category_name')}
                      />
                      {errors.name && (
                        <div className="text-xs text-rose-600 mt-1">{String(errors.name.message)}</div>
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
              <div className="flex justify-end gap-2 mt-4">
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
