import clsx from "clsx";
import type React from "react";
import { useCallback, useRef } from "react";

import { useI18n } from "../../i18n";
import type {
	CustomizableComponentProps,
	I18nConfig,
	UploadOptions,
} from "../../types";

export interface UploadProps extends CustomizableComponentProps {
	onFileSelect: (file: File) => void;
	options?: Partial<UploadOptions>;
	disabled?: boolean;
	loading?: boolean;
	error?: string | null;
	i18n?: Partial<I18nConfig>;
}

export function Upload({
	onFileSelect,
	options = {},
	disabled = false,
	loading = false,
	error = null,
	i18n,
	theme,
	className = "",
	customComponents = {},
	customStyles = {},
}: UploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const {
		acceptedFormats = [".csv", ".xlsx", ".xls"],
		maxFileSize = 10, // MB
		multiple = false,
	} = options;

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (files && files.length > 0) {
				const file = files[0];

				// Validate file size
				if (file.size > maxFileSize * 1024 * 1024) {
					// Handle error - file too large
					return;
				}

				onFileSelect(file);
			}
		},
		[onFileSelect, maxFileSize]
	);

	const handleDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	const handleDragEnter = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();
			event.stopPropagation();

			if (disabled || loading) return;

			const files = event.dataTransfer.files;
			if (files && files.length > 0) {
				const file = files[0];

				// Validate file size
				if (file.size > maxFileSize * 1024 * 1024) {
					// Handle error - file too large
					return;
				}

				onFileSelect(file);
			}
		},
		[onFileSelect, maxFileSize, disabled, loading]
	);

	const handleBrowseClick = useCallback(() => {
		if (fileInputRef.current && !disabled && !loading) {
			fileInputRef.current.click();
		}
	}, [disabled, loading]);

	const ButtonComponent = customComponents.Button || "button";
	const LoadingComponent = customComponents.Loading || "div";

	return (
		<div
			className={clsx(
				"rsu rsu:relative rsu:flex rsu:w-full rsu:items-center rsu:justify-center rsu:px-4",
				className,
				customStyles.container
			)}
		>
			<button
				type="button"
				className={clsx(
					"rsu:w-full rsu:max-w-2xl rsu:cursor-pointer rsu:border-2 rsu:border-dashed rsu:p-6 rsu:text-center rsu:transition-all rsu:duration-300 rsu:hover:scale-[1.02] rsu:active:scale-[0.98] rsu:sm:p-8 rsu:lg:p-12",
					{
						"rsu:cursor-not-allowed rsu:opacity-50 rsu:hover:scale-100":
							disabled,
						"rsu:pointer-events-none": loading,
					},
					customStyles.button
				)}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDrop={handleDrop}
				onClick={handleBrowseClick}
				tabIndex={disabled || loading ? -1 : 0}
				style={{
					borderRadius: theme?.borderRadius || "0.5rem",
					borderColor: error
						? theme?.colors.error || "#EF4444"
						: theme?.colors.secondary || "#6B7280",
					backgroundColor: error
						? `${theme?.colors.error || "#EF4444"}10`
						: theme?.colors.surface || "#FFFFFF",
					color: theme?.colors.text || "#1F2937",
					boxShadow:
						theme?.shadows.sm || "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				}}
			>
				{loading ? (
					<LoadingComponent className="rsu:flex rsu:flex-col rsu:items-center rsu:space-y-4">
						<div
							className="rsu:h-8 rsu:w-8 rsu:animate-spin rsu:rounded-full rsu:border-2 rsu:border-transparent"
							style={{
								borderTopColor:
									theme?.colors.primary || "#3B82F6",
								borderRightColor:
									theme?.colors.primary || "#3B82F6",
							}}
						></div>
						<p
							className="rsu:text-sm"
							style={{
								color: theme?.colors.textSecondary || "#6B7280",
							}}
						>
							{t("upload.processing")}
						</p>
					</LoadingComponent>
				) : (
					<div className="rsu:space-y-4 rsu:sm:space-y-6">
						<div
							className="rsu:mx-auto rsu:h-10 rsu:w-10 rsu:sm:h-12 rsu:sm:w-12 rsu:lg:h-16 rsu:lg:w-16"
							style={{
								color: theme?.colors.secondary || "#6B7280",
							}}
						>
							<svg
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
						</div>

						<div className="rsu:space-y-2 rsu:sm:space-y-3">
							<p
								className="rsu:font-medium rsu:text-base rsu:sm:text-lg rsu:lg:text-xl"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("upload.dragAndDrop")}
							</p>
							<p
								className="rsu:text-sm rsu:sm:text-base"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{t("upload.or")}
							</p>
						</div>

						<ButtonComponent
							type="button"
							className={clsx(
								"rsu:inline-flex rsu:items-center rsu:border rsu:border-transparent rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-sm rsu:transition-all rsu:duration-200 rsu:hover:scale-105 rsu:focus:outline-none rsu:focus:ring-2 rsu:focus:ring-offset-2 rsu:active:scale-95 rsu:sm:px-6 rsu:sm:py-3 rsu:sm:text-base",
								customStyles.button
							)}
							disabled={disabled}
							style={{
								borderRadius: theme?.borderRadius || "0.375rem",
								backgroundColor:
									theme?.colors.primary || "#3B82F6",
								color: theme?.colors.surface || "#FFFFFF",
								boxShadow:
									theme?.shadows.sm ||
									"0 1px 2px 0 rgba(0, 0, 0, 0.05)",
							}}
						>
							{t("upload.browse")}
						</ButtonComponent>

						<div
							className="rsu:space-y-1 rsu:text-sm"
							style={{
								color: theme?.colors.textSecondary || "#6B7280",
							}}
						>
							<p>{t("upload.supportedFormats")}</p>
							<p>
								{t("upload.maxFileSize", {
									maxSize: maxFileSize,
								})}
							</p>
						</div>
					</div>
				)}

				{error && (
					<div
						className="rsu:mt-4 rsu:border rsu:p-3"
						style={{
							borderRadius: theme?.borderRadius || "0.375rem",
							borderColor: theme?.colors.error || "#EF4444",
							backgroundColor: `${
								theme?.colors.error || "#EF4444"
							}10`,
						}}
					>
						<p
							className="rsu:text-sm"
							style={{ color: theme?.colors.error || "#EF4444" }}
						>
							{error}
						</p>
					</div>
				)}
			</button>

			<input
				ref={fileInputRef}
				type="file"
				accept={acceptedFormats.join(",")}
				multiple={multiple}
				onChange={handleFileChange}
				className="rsu:hidden"
				disabled={disabled}
			/>
		</div>
	);
}
