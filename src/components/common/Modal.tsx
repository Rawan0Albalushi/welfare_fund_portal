import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title?: string;
	icon?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	children: React.ReactNode;
	footer?: React.ReactNode;
	closeOnBackdrop?: boolean;
}

const sizeToMaxWidth: Record<NonNullable<ModalProps['size']>, string> = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-2xl',
	xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
	open,
	onClose,
	title,
	icon,
	size = 'md',
	children,
	footer,
	closeOnBackdrop = true,
}) => {
	const dialogRef = useRef<HTMLDivElement>(null);
	const { isRTL } = useLanguage();

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center pt-36 sm:pt-44 pb-14 px-4 sm:px-6 overflow-y-auto animate-fade-in"
			role="dialog"
			aria-modal="true"
		>
			<div
				className="fixed inset-0 z-0 bg-black/50 backdrop-blur-sm"
				onClick={closeOnBackdrop ? onClose : undefined}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				className={`relative z-10 mt-8 sm:mt-12 w-full ${sizeToMaxWidth[size]} max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-7rem)] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden`}
			>
				{(title || icon) && (
					<div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 p-6">
						<div className="absolute inset-0 bg-black/10" />
						<div className="relative flex items-center gap-4">
							{icon ? (
								<div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
									{icon}
								</div>
							) : null}
							{title ? (
								<div>
									<h3 className="text-2xl font-bold text-white">{title}</h3>
									<p className="text-primary-100 text-sm" />
								</div>
							) : null}
							<button
								type="button"
								className={`ml-auto rounded-lg bg-white/10 hover:bg-white/20 text-white px-2 py-1 ${isRTL ? 'order-first' : ''}`}
								onClick={onClose}
								aria-label="Close"
							>
								✕
							</button>
						</div>
					</div>
				)}

				<div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
					{children}
				</div>

				{footer ? (
					<div className={`shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 backdrop-blur ${isRTL ? 'text-right' : ''}`}>
						{footer}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Modal;


