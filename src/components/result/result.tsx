import clsx from "clsx";
import { useMemo } from "react";

import { useI18n } from "../../i18n";
import type {
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
	ValidationResult,
} from "../../types";

export interface ResultProps extends CustomizableComponentProps {
	data: SpreadsheetData;
	mappings: ColumnMappingType[];
	validationResult: ValidationResult | null;
	transformedData: Record<string, unknown>[] | null;
	onFinish: () => void;
	i18n?: Partial<I18nConfig>;
}

export function Result({
	data,
	mappings,
	validationResult,
	transformedData,
	onFinish,
	i18n,
	theme,
	className = "",
	customComponents = {},
}: ResultProps) {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const ButtonComponent = customComponents.Button || "button";

	const stats = useMemo(() => {
		return {
			totalRows: transformedData?.length || 0,
			totalFields: mappings.length,
			validRows: validationResult?.isValid
				? transformedData?.length || 0
				: 0,
			errorCount: validationResult?.errors.length || 0,
			warningCount: validationResult?.warnings.length || 0,
		};
	}, [transformedData, mappings, validationResult]);

	const hasIssues = (stats.errorCount || 0) + (stats.warningCount || 0) > 0;

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-6 rsu:px-4 rsu:text-center rsu:sm:space-y-8",
				className
			)}
		>
			{/* Success Icon */}
			<div
				className="rsu:mx-auto rsu:flex rsu:h-16 rsu:w-16 rsu:items-center rsu:justify-center rsu:rounded-full rsu:sm:h-20 rsu:sm:w-20 rsu:lg:h-24 rsu:lg:w-24"
				style={{
					backgroundColor: `${theme?.colors.success || "#10B981"}20`,
					borderRadius: theme?.borderRadius || "0.375rem",
				}}
			>
				<svg
					className="rsu:h-8 rsu:w-8 rsu:sm:h-10 rsu:sm:w-10 rsu:lg:h-12 rsu:lg:w-12"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-label={t("result.successAriaLabel")}
					style={{ color: theme?.colors.success || "#10B981" }}
				>
					<title>Success</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>

			{/* Title */}
			<div>
				<h3
					className="rsu:mb-2 rsu:font-bold rsu:text-2xl"
					style={{ color: theme?.colors.text || "#1F2937" }}
				>
					{t("result.title")}
				</h3>
			</div>

			{/* Status Messages */}
			<div className="rsu:space-y-3">
				{validationResult?.isValid && (
					<div
						className="rsu:p-4"
						style={{
							backgroundColor: `${
								theme?.colors.success || "#10B981"
							}10`,
							borderRadius: theme?.borderRadius || "0.375rem",
						}}
					>
						<div className="rsu:flex rsu:items-center rsu:justify-center">
							<svg
								className="rsu:mr-2 rsu:h-5 rsu:w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label={t("result.successAriaLabel")}
								style={{
									color: theme?.colors.success || "#10B981",
								}}
							>
								<title>Success</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.success || "#10B981",
								}}
							>
								{t("result.allValid")}
							</span>
						</div>
					</div>
				)}

				{hasIssues && (
					<div
						className="rsu:p-4"
						style={{
							backgroundColor: `${
								theme?.colors.warning || "#F59E0B"
							}10`,
							borderRadius: theme?.borderRadius || "0.375rem",
						}}
					>
						<div className="rsu:flex rsu:items-center rsu:justify-center">
							<svg
								className="rsu:mr-2 rsu:h-5 rsu:w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label={t("result.warningAriaLabel")}
								style={{
									color: theme?.colors.warning || "#F59E0B",
								}}
							>
								<title>Warning</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.warning || "#F59E0B",
								}}
							>
								{t("result.issuesFound", {
									errors: stats.errorCount,
									warnings: stats.warningCount,
								})}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* File Info */}
			<div
				className="rsu:p-4"
				style={{
					backgroundColor: `${
						theme?.colors.secondary || "#6B7280"
					}10`,
					borderRadius: theme?.borderRadius || "0.375rem",
				}}
			>
				<div
					className="rsu:text-sm"
					style={{ color: theme?.colors.textSecondary || "#6B7280" }}
				>
					<p className="rsu:mb-1">
						<span
							className="rsu:font-medium"
							style={{ color: theme?.colors.text || "#1F2937" }}
						>
							{t("result.fileName")}
						</span>{" "}
						{data?.fileName}
					</p>
					<p className="rsu:mb-1">
						<span
							className="rsu:font-medium"
							style={{ color: theme?.colors.text || "#1F2937" }}
						>
							{t("result.processedAt")}
						</span>{" "}
						{new Date().toLocaleString()}
					</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="rsu:flex rsu:justify-center rsu:space-x-4">
				<ButtonComponent
					type="button"
					onClick={onFinish}
					className="rsu:inline-flex rsu:items-center rsu:border rsu:border-transparent rsu:px-6 rsu:py-3 rsu:font-medium rsu:text-sm rsu:transition-colors rsu:focus:outline-none rsu:focus:ring-2 rsu:focus:ring-offset-2"
					style={{
						borderRadius: theme?.borderRadius || "0.375rem",
						backgroundColor: theme?.colors.success || "#10B981",
						color: theme?.colors.surface || "#FFFFFF",
						boxShadow:
							theme?.shadows.sm ||
							"0 1px 2px 0 rgba(0, 0, 0, 0.05)",
					}}
				>
					<svg
						className="rsu:mr-2 rsu:h-5 rsu:w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-label={t("result.finishAriaLabel")}
					>
						<title>Finish</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					{t("result.finish")}
				</ButtonComponent>
			</div>
		</div>
	);
}
