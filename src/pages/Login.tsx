import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { type LoginRequest } from '../types';
import { FormField } from '../components/common/FormField';

export const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 [Login] User is already authenticated, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check for existing auth data on component mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      console.log('🔄 [Login] Found existing auth data, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoginError('');
      console.log('🚀 [Login] Starting login process with data:', data);
      
      const result = await login(data);
      console.log('✅ [Login] Login completed successfully:', result);
      
      // Wait a bit for the mutation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if we have the token and user data
      const token = localStorage.getItem('admin_token');
      const userStr = localStorage.getItem('admin_user');
      let parsedUserName: string | null = null;
      try {
        parsedUserName = userStr ? JSON.parse(userStr).name : null;
      } catch (e) {
        console.warn('⚠️ [Login] Failed to parse admin_user from localStorage');
      }
      
      console.log('🔍 [Login] Post-login check:', {
        hasToken: !!token,
        hasUser: !!userStr,
        tokenValue: token ? token.substring(0, 20) + '...' : null,
        userValue: parsedUserName,
        timestamp: new Date().toISOString()
      });
      
      if (token && userStr) {
        console.log('🎯 [Login] Redirecting to dashboard...');
        // Force page reload to ensure auth state is properly initialized
        window.location.href = '/dashboard';
      } else {
        console.error('❌ [Login] Missing token or user data after login');
        setLoginError('Login successful but authentication data is missing');
      }
    } catch (err: any) {
      console.error('❌ [Login] Login failed:', err);
      console.error('❌ [Login] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });
      
      // Show specific error messages based on the error type
      let errorMessage = t('auth.login_error');
      
      if (err.response?.status === 401) {
        errorMessage = 'بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.';
      } else if (err.response?.status === 422) {
        errorMessage = 'البيانات المدخلة غير صحيحة. تحقق من صحة البيانات.';
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من أن الخادم يعمل.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'خطأ في الخادم. حاول مرة أخرى لاحقاً.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setLoginError(errorMessage);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div
        dir={i18n.dir()}
        className="w-full max-w-md rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card p-6 sm:p-8"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm mb-3">
            <span className="text-lg font-semibold">SW</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">{t('auth.login')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Student Welfare Fund Admin Portal</p>
          
          {/* Debug Info */}
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'غير محدد'}</p>
            <p><strong>الخادم:</strong> {import.meta.env.VITE_API_URL ? 'مُعرّف' : 'غير مُعرّف'}</p>
          </div>
        </div>

        {loginError && (
          <div className="mb-3 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-3 py-2 text-sm">
            <div className="flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">خطأ في تسجيل الدخول</p>
                <p className="mt-1">{loginError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <FormField
            name="email"
            control={control}
            label="البريد الإلكتروني"
            type="email"
            required
            fullWidth
            helperText={errors.email?.message as string}
            error={!!errors.email}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: t('auth.password') + ' ' + t('common.required'),
              minLength: { value: 6, message: t('auth.password') + ' ' + t('common.min_length') },
            }}
            render={({ field }) => (
              <div className="w-full">
                <label className="block text-sm mb-1">
                  {t('auth.password')} <span className="text-rose-500">*</span>
                </label>
                <input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('auth.password') as string}
                  className={`w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500/60 ${errors.password ? 'border-rose-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}
                />
                {errors.password?.message && (
                  <div className="text-xs mt-1 text-rose-600">{errors.password.message}</div>
                )}
              </div>
            )}
          />

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-10 rounded-md bg-primary-600 hover:bg-primary-700 transition text-white disabled:opacity-60"
          >
            {isLoggingIn ? t('common.loading') : t('auth.login')}
          </button>
        </form>
      </div>
    </div>
  );
};
