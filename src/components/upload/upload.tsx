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
			className={`rsu:relative rsu:flex rsu:w-full rsu:items-center rsu:justify-center ${className} ${
				customStyles.container || ""
			}`}
		>
			<button
				type="button"
				className={clsx(
					"rsu:w-full rsu:max-w-md rsu:cursor-pointer rsu:rounded-lg rsu:border-2 rsu:border-gray-300 rsu:border-dashed rsu:p-12 rsu:text-center rsu:transition-colors rsu:hover:border-gray-400 rsu:hover:bg-gray-50",
					{
						"rsu:cursor-not-allowed rsu:opacity-50": disabled,
						"rsu:pointer-events-none": loading,
						"rsu:border-red-300 rsu:bg-red-50": error,
					}
				)}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDrop={handleDrop}
				onClick={handleBrowseClick}
				tabIndex={disabled || loading ? -1 : 0}
			>
				{loading ? (
					<LoadingComponent className="rsu:flex rsu:flex-col rsu:items-center rsu:space-y-4">
						<div className="rsu:h-8 rsu:w-8 rsu:animate-spin rsu:rounded-full rsu:border-blue-600 rsu:border-b-2"></div>
						<p className="rsu:text-gray-600">
							{t("upload.processing")}
						</p>
					</LoadingComponent>
				) : (
					<div className="rsu:space-y-4">
						<div className="rsu:mx-auto rsu:h-12 rsu:w-12 rsu:text-gray-400">
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

						<div className="rsu:space-y-2">
							<p className="rsu:font-medium rsu:text-gray-900 rsu:text-lg">
								{t("upload.dragAndDrop")}
							</p>
							<p className="rsu:text-gray-500">
								{t("upload.or")}
							</p>
						</div>

						<ButtonComponent
							type="button"
							className={`rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-transparent rsu:bg-blue-600 rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-sm rsu:text-white rsu:hover:bg-blue-700 rsu:focus:outline-none rsu:focus:ring-2 rsu:focus:ring-blue-500 rsu:focus:ring-offset-2 ${
								customStyles.button || ""
							}
              `}
							disabled={disabled}
						>
							{t("upload.browse")}
						</ButtonComponent>

						<div className="rsu:space-y-1 rsu:text-gray-500 rsu:text-sm">
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
					<div className="rsu:mt-4 rsu:rounded-md rsu:border rsu:border-red-300 rsu:bg-red-100 rsu:p-3">
						<p className="rsu:text-red-700 rsu:text-sm">{error}</p>
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
