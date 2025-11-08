import apiClient from '../axios';

export const uploadService = {
	uploadImage: async (file: File): Promise<string> => {
		// Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (file.size > maxSize) {
			throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10MB');
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			throw new Error('نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP)');
		}

		const formData = new FormData();
		formData.append('image', file);
		
		try {
			// Note: baseURL already includes /api/v1/admin, so we use /upload/image
			const response = await apiClient.post('/upload/image', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			const payload = response.data ?? {};
			const url =
				payload?.data?.image_url ??
				payload?.image_url ??
				payload?.data?.url ??
				payload?.url;

			if (typeof url === 'string' && url.trim() !== '') {
				return url;
			}

			throw new Error('لم يتم إرجاع URL للصورة من الخادم');
		} catch (error: any) {
			// Handle validation errors from backend
			if (error.response?.status === 422) {
				const errors = error.response.data?.errors || error.response.data?.message;
				if (errors?.image) {
					throw new Error(Array.isArray(errors.image) ? errors.image[0] : errors.image);
				}
				if (typeof errors === 'string') {
					throw new Error(errors);
				}
				throw new Error('خطأ في التحقق من الصورة: ' + JSON.stringify(errors));
			}
			
			// Re-throw if it's already our custom error
			if (error.message && error.message.includes('حجم') || error.message.includes('نوع')) {
				throw error;
			}
			
			// Generic error
			throw new Error(error?.response?.data?.message || error?.message || 'فشل في رفع الصورة');
		}
	},
};

