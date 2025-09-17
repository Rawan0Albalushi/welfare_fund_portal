import React, { useState } from 'react';
// Buttons/alerts migrated off MUI
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePrograms, useCreateProgram, useUpdateProgram, useDeleteProgram } from '../hooks/usePrograms';
import { DataTable, type Column } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Program, type CreateProgramRequest, type UpdateProgramRequest } from '../types';

export const Programs: React.FC = () => {
  const { t } = useTranslation();
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

  // No categories needed

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
      name: '',
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
      id: 'name',
      label: t('programs.program_title'),
      minWidth: 200,
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
        name: (program as any).name || (program as any).title || '',
        status: (program as any).status,
      });
    } else {
      setEditingProgram(null);
      reset({
        name: '',
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('programs.title')}</h1>
        <button
          onClick={() => handleOpenDialog()}
          className="h-10 px-4 rounded-lg text-white bg-primary-600 hover:bg-primary-700"
        >
          + {t('programs.add_program')}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
          totalCount={programsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
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
              <div className="flex flex-col gap-3">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('programs.program_title') + ' is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1">{t('programs.program_title')}</label>
                      <input
                        {...field}
                        autoFocus
                        className={`w-full h-10 px-3 rounded-md border ${(errors as any).name ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                        placeholder={t('programs.program_title')}
                      />
                      {(errors as any).name && (
                        <div className="text-xs text-rose-600 mt-1">{String((errors as any).name.message)}</div>
                      )}
                    </div>
                  )}
                />
                
                
                

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm mb-1">{t('programs.program_status')}</label>
                      <select
                        {...field}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
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
