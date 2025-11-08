import i18n from '../i18n';

export type UserFacingError = {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
};

export function getUserFriendlyError(error: any): UserFacingError {
  // Axios-like error shape handling
  const status: number | undefined = error?.response?.status;
  const serverMessage: string | undefined = error?.response?.data?.message || error?.message;

  // Network or CORS
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || (!error?.response && error?.request)) {
    return { message: i18n.t('errors.network_error'), severity: 'error' };
  }

  if (error?.code === 'ECONNABORTED' || String(error?.message || '').toLowerCase().includes('timeout')) {
    return { message: i18n.t('errors.network_error'), severity: 'error' };
  }

  switch (status) {
    case 400:
    case 422:
      return { message: serverMessage || i18n.t('errors.validation_error'), severity: 'warning' };
    case 401:
      return { message: i18n.t('errors.unauthorized'), severity: 'error' };
    case 403:
      return { message: i18n.t('errors.forbidden'), severity: 'error' };
    case 404:
      return { message: i18n.t('errors.not_found'), severity: 'warning' };
    case 500:
    case 502:
    case 503:
    case 504:
      return { message: i18n.t('errors.server_error'), severity: 'error' };
    default:
      return { message: serverMessage || i18n.t('errors.unknown_error'), severity: 'error' };
  }
}




