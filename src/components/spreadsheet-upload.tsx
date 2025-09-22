"use client";

import clsx from "clsx";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";

import {
	useFileParser,
	useSpreadsheetData,
	useValidation as useValidationHook,
} from "../hooks";
import { useI18n } from "../i18n";
import type {
	AvailableField,
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
	ThemeConfig,
	UploadOptions,
	ValidationResult,
} from "../types";

// Lazy load components that are not always needed
const ColumnMapping = lazy(() =>
	import("./column-mapping").then((m) => ({ default: m.ColumnMapping })),
);
const DataEditor = lazy(() =>
	import("./data-editor").then((m) => ({ default: m.DataEditor })),
);
const Preview = lazy(() =>
	import("./preview").then((m) => ({ default: m.Preview })),
);
const Result = lazy(() =>
	import("./result").then((m) => ({ default: m.Result })),
);
const Upload = lazy(() =>
	import("./upload").then((m) => ({ default: m.Upload })),
);
const Validation = lazy(() =>
	import("./validation").then((m) => ({ default: m.Validation })),
);

export interface SpreadsheetUploadProps
	extends Omit<CustomizableComponentProps, "theme"> {
	onDataProcessed?: (
		data: SpreadsheetData,
		mappings: ColumnMappingType[],
		validation: ValidationResult,
		transformedData: Record<string, unknown>[] | null,
	) => void;
	uploadOptions?: Partial<UploadOptions>;
	availableFields?: AvailableField[];
	theme?: Partial<ThemeConfig>;
	i18n?: Partial<I18nConfig>;
	showSteps?: boolean;
	autoValidate?: boolean;
	autoMap?: boolean;
}

export function SpreadsheetUpload({
	onDataProcessed,
	uploadOptions = {},
	availableFields = [],
	theme: userTheme,
	i18n,
	showSteps = true,
	autoValidate = true,
	autoMap = false,
	className = "",
	customComponents = {},
	customStyles = {},
}: SpreadsheetUploadProps) {
	const [currentStep, setCurrentStep] = useState<
		"upload" | "preview" | "mapping" | "validation" | "editor" | "result"
	>("upload");

	// Default theme configuration
	const defaultTheme: ThemeConfig = {
		colors: {
			primary: "#3B82F6",
			secondary: "#6B7280",
			success: "#10B981",
			warning: "#F59E0B",
			error: "#EF4444",
			background: "#F9FAFB",
			surface: "#FFFFFF",
			text: "#1F2937",
			textSecondary: "#6B7280",
		},
		spacing: {
			xs: "0.25rem",
			sm: "0.5rem",
			md: "1rem",
			lg: "1.5rem",
			xl: "2rem",
		},
		borderRadius: "0.375rem",
		shadows: {
			sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
			lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
		},
	};

	// Merge user theme with default theme
	const theme = useMemo(() => {
		if (!userTheme) return defaultTheme;

		return {
			colors: { ...defaultTheme.colors, ...userTheme.colors },
			spacing: { ...defaultTheme.spacing, ...userTheme.spacing },
			borderRadius: userTheme.borderRadius || defaultTheme.borderRadius,
			shadows: { ...defaultTheme.shadows, ...userTheme.shadows },
		};
	}, [userTheme]);

	const {
		data,
		validationResult,
		columnMappings,
		isLoading,
		error,
		transformedData,
		setData,
		setValidationResult,
		setColumnMappings,
		setLoading,
		setError,
		clearData,
		updateCell,
	} = useSpreadsheetData();

	const { parseFile } = useFileParser();
	const { validateData } = useValidationHook(i18n);
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const handleFileSelect = useCallback(
		async (file: File) => {
			try {
				setLoading(true);
				setError(null);

				const parsedData = await parseFile(file);
				setData(parsedData);

				if (autoMap && availableFields.length > 0) {
					const autoMappings: ColumnMappingType[] = [];

					const matchesField = (
						header: string,
						field: AvailableField,
					): boolean => {
						const normalize = (str: string) =>
							str
								.toLowerCase()
								.trim()
								.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.replace(/[^\w\s-]/g, "")
								.replace(/\s+/g, " ");

						const headerNormalized = normalize(header);
						const labelNormalized = normalize(field.label);

						if (labelNormalized === headerNormalized) {
							return true;
						}

						if (field.columnCandidates) {
							const exactCandidateMatch =
								field.columnCandidates.some(
									(candidate) =>
										normalize(candidate) ===
										headerNormalized,
								);
							if (exactCandidateMatch) return true;

							const partialCandidateMatch =
								field.columnCandidates.some((candidate) => {
									const candidateNormalized =
										normalize(candidate);
									return (
										candidateNormalized.includes(
											headerNormalized,
										) ||
										headerNormalized.includes(
											candidateNormalized,
										)
									);
								});
							if (partialCandidateMatch) return true;
						}

						if (
							labelNormalized.includes(headerNormalized) ||
							headerNormalized.includes(labelNormalized)
						) {
							return true;
						}

						return false;
					};

					parsedData.headers.forEach((header, index) => {
						const matchingField = availableFields.find((field) =>
							matchesField(header, field),
						);

						if (matchingField) {
							autoMappings.push({
								sourceIndex: index,
								sourceName: header,
								targetField: matchingField.field,
								targetLabel: matchingField.label,
								dataType: matchingField.dataType,
								required: matchingField.required || false,
								validation: [],
							});
						}
					});
					setColumnMappings(autoMappings);
				}

				setCurrentStep("preview");
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("common.unknownError"),
				);
			} finally {
				setLoading(false);
			}
		},
		[
			parseFile,
			setData,
			setLoading,
			setError,
			autoMap,
			availableFields,
			setColumnMappings,
			t,
		],
	);

	const handleMappingsChange = useCallback(
		(mappings: ColumnMappingType[]) => {
			setColumnMappings(mappings);

			if (autoValidate && data) {
				const validation = validateData(data, mappings);
				setValidationResult(validation);
			}
		},
		[
			setColumnMappings,
			autoValidate,
			data,
			validateData,
			setValidationResult,
		],
	);

	const handleDataChange = useCallback(
		(newData: SpreadsheetData) => {
			setData(newData);

			if (autoValidate && columnMappings.length > 0) {
				const validation = validateData(newData, columnMappings);
				setValidationResult(validation);
			}
		},
		[
			setData,
			autoValidate,
			columnMappings,
			validateData,
			setValidationResult,
		],
	);

	const handleValidate = useCallback(() => {
		if (data && columnMappings.length > 0) {
			const validation = validateData(data, columnMappings);
			setValidationResult(validation);
			setCurrentStep("validation");

			if (onDataProcessed) {
				onDataProcessed(
					data,
					columnMappings,
					validation,
					transformedData,
				);
			}
		}
	}, [
		data,
		columnMappings,
		validateData,
		setValidationResult,
		onDataProcessed,
		transformedData,
	]);

	const handleClear = useCallback(() => {
		clearData();
		setCurrentStep("upload");
	}, [clearData]);

	const getAccessibleSteps = useCallback(() => {
		const hasData = !!data;
		const hasMappings = columnMappings.length > 0;

		// Check if all required fields are mapped
		const mappedTargetFields = new Set(
			columnMappings.map((m) => m.targetField),
		);
		const allRequiredFieldsMapped = availableFields
			.filter((field) => field.required)
			.every((field) => mappedTargetFields.has(field.field));

		return {
			upload: true,
			preview: hasData,
			mapping: hasData,
			validation: hasData && hasMappings && allRequiredFieldsMapped,
			editor: hasData,
			result: hasData && hasMappings && allRequiredFieldsMapped,
		};
	}, [data, columnMappings, availableFields]);

	const accessibleSteps = getAccessibleSteps();

	const steps = useMemo(
		() => [
			{
				key: "upload",
				label: t("actions.upload"),
				completed: !!data,
				accessible: accessibleSteps.upload,
			},
			{
				key: "preview",
				label: t("actions.preview"),
				completed: !!data,
				accessible: accessibleSteps.preview,
			},
			{
				key: "mapping",
				label: t("actions.map"),
				completed: columnMappings.length > 0,
				accessible: accessibleSteps.mapping,
			},
			{
				key: "validation",
				label: t("actions.validate"),
				completed: !!validationResult,
				accessible: accessibleSteps.validation,
			},
			{
				key: "editor",
				label: t("actions.edit"),
				completed: !!data,
				accessible: accessibleSteps.editor,
			},
			{
				key: "result",
				label: t("actions.result"),
				completed: !!data && columnMappings.length > 0,
				accessible: accessibleSteps.result,
			},
		],
		[t, data, columnMappings, validationResult, accessibleSteps],
	);

	const getNavigationState = useCallback(() => {
		const currentIndex = steps.findIndex(
			(step: (typeof steps)[0]) => step.key === currentStep,
		);

		const canGoBack = currentIndex > 0;

		// Check if all required fields are mapped
		const mappedTargetFields = new Set(
			columnMappings.map((m) => m.targetField),
		);
		const allRequiredFieldsMapped = availableFields
			.filter((field) => field.required)
			.every((field) => mappedTargetFields.has(field.field));

		let canGoForward = false;
		switch (currentStep) {
			case "upload":
				canGoForward = !!data;
				break;
			case "preview":
				canGoForward = true;
				break;
			case "mapping":
				canGoForward = !!validationResult && allRequiredFieldsMapped;
				break;
			case "validation":
				canGoForward = !!data;
				break;
			case "editor":
				canGoForward =
					!!data &&
					columnMappings.length > 0 &&
					allRequiredFieldsMapped;
				break;
			case "result":
				canGoForward = false; // Can't go forward from result
				break;
			default:
				canGoForward = false;
		}

		// Get previous/next step keys
		const prevStep = canGoBack
			? (steps[currentIndex - 1] as (typeof steps)[0])?.key
			: null;
		const nextStep = canGoForward
			? (steps[currentIndex + 1] as (typeof steps)[0])?.key
			: null;

		return {
			canGoBack,
			canGoForward,
			prevStep,
			nextStep,
		};
	}, [
		currentStep,
		steps,
		data,
		columnMappings,
		validationResult,
		availableFields,
	]);

	const navigation = getNavigationState();

	// Navigation buttons component
	const NavigationButtons = ({
		showSkip = false,
	}: {
		showSkip?: boolean;
	}) => {
		const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

		if (!navigation.canGoBack && !navigation.canGoForward && !showSkip) {
			return null;
		}

		return (
			<div className="rsu:mt-6 rsu:flex rsu:items-center rsu:justify-between rsu:border-t rsu:pt-4">
				<div>
					{navigation.canGoBack && navigation.prevStep && (
						<ButtonComponent
							type="button"
							onClick={() =>
								setCurrentStep(
									navigation.prevStep as typeof currentStep,
								)
							}
							className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-gray-300 rsu:bg-white rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-gray-700 rsu:text-sm rsu:hover:bg-gray-50"
						>
							<svg
								className="rsu:mr-2 rsu:h-4 rsu:w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label={t("navigation.previous")}
							>
								<title>{t("navigation.previous")}</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							{t("navigation.previous")}
						</ButtonComponent>
					)}
				</div>

				<div className="rsu:flex rsu:space-x-2">
					{showSkip && (
						<ButtonComponent
							type="button"
							onClick={() => setCurrentStep("result")}
							className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-gray-300 rsu:bg-gray-100 rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-gray-500 rsu:text-sm rsu:hover:bg-gray-200"
						>
							{t("navigation.skip")}
						</ButtonComponent>
					)}

					{navigation.canGoForward && navigation.nextStep && (
						<ButtonComponent
							type="button"
							onClick={() =>
								setCurrentStep(
									navigation.nextStep as typeof currentStep,
								)
							}
							className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-transparent rsu:bg-blue-600 rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-sm rsu:text-white rsu:hover:bg-blue-700"
						>
							{t("navigation.next")}
							<svg
								className="rsu:ml-2 rsu:h-4 rsu:w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label={t("navigation.next")}
							>
								<title>{t("navigation.next")}</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</ButtonComponent>
					)}
				</div>
			</div>
		);
	};

	const renderStepContent = () => {
		const LoadingFallback = () => (
			<div className="rsu:flex rsu:items-center rsu:justify-center rsu:py-8">
				<div className="rsu:h-8 rsu:w-8 rsu:animate-spin rsu:rounded-full rsu:border-blue-600 rsu:border-b-2"></div>
			</div>
		);

		switch (currentStep) {
			case "upload":
				return (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<Upload
								onFileSelect={handleFileSelect}
								options={uploadOptions}
								loading={isLoading}
								error={error}
								i18n={i18n}
								theme={theme}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				);

			case "preview":
				return data ? (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<Preview
								data={data}
								i18n={i18n}
								theme={theme}
								onCellClick={(row, column, value) => {
									console.log("Cell clicked:", {
										row,
										column,
										value,
									});
								}}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				) : null;

			case "mapping":
				return data ? (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<ColumnMapping
								data={data}
								mappings={columnMappings}
								onMappingsChange={handleMappingsChange}
								availableFields={availableFields}
								autoMapEnabled={autoMap}
								i18n={i18n}
								theme={theme}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				) : null;

			case "validation":
				return validationResult ? (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<Validation
								validationResult={validationResult}
								i18n={i18n}
								theme={theme}
								onErrorClick={(error) => {
									console.log("Error clicked:", error);
								}}
								onWarningClick={(warning) => {
									console.log("Warning clicked:", warning);
								}}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				) : (
					<div className="rsu:py-8 rsu:text-center">
						<ButtonComponent
							onClick={handleValidate}
							className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-transparent rsu:bg-blue-600 rsu:px-4 rsu:py-2 rsu:font-medium rsu:text-sm rsu:text-white rsu:hover:bg-blue-700"
						>
							{t("actions.validate")}
						</ButtonComponent>
					</div>
				);

			case "editor":
				return data ? (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<DataEditor
								data={data}
								mappings={columnMappings}
								validationResult={validationResult || undefined}
								i18n={i18n}
								onDataChange={handleDataChange}
								onCellEdit={(row, column, value) => {
									updateCell(row, column, value);
								}}
								theme={theme}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				) : null;

			case "result":
				return data ? (
					<div className="rsu:w-full">
						<Suspense fallback={<LoadingFallback />}>
							<Result
								data={data}
								i18n={i18n}
								mappings={columnMappings}
								validationResult={validationResult}
								transformedData={transformedData}
								onFinish={() => {
									if (onDataProcessed && validationResult) {
										onDataProcessed(
											data,
											columnMappings,
											validationResult,
											transformedData,
										);
									}
								}}
								theme={theme}
								customComponents={customComponents}
								customStyles={customStyles}
							/>
						</Suspense>
						<NavigationButtons />
					</div>
				) : null;

			default:
				return null;
		}
	};

	const ButtonComponent = customComponents.Button || "button";

	// Apply theme variables to CSS custom properties
	const themeStyles = useMemo(
		() =>
			({
				"--rsu-color-primary": theme.colors.primary,
				"--rsu-color-secondary": theme.colors.secondary,
				"--rsu-color-success": theme.colors.success,
				"--rsu-color-warning": theme.colors.warning,
				"--rsu-color-error": theme.colors.error,
				"--rsu-color-background": theme.colors.background,
				"--rsu-color-surface": theme.colors.surface,
				"--rsu-color-text": theme.colors.text,
				"--rsu-color-text-secondary": theme.colors.textSecondary,
				"--rsu-spacing-xs": theme.spacing.xs,
				"--rsu-spacing-sm": theme.spacing.sm,
				"--rsu-spacing-md": theme.spacing.md,
				"--rsu-spacing-lg": theme.spacing.lg,
				"--rsu-spacing-xl": theme.spacing.xl,
				"--rsu-border-radius": theme.borderRadius,
				"--rsu-shadow-sm": theme.shadows.sm,
				"--rsu-shadow-md": theme.shadows.md,
				"--rsu-shadow-lg": theme.shadows.lg,
			}) as React.CSSProperties,
		[theme],
	);

	return (
		<div
			className={clsx(
				"rsu rsu:mx-auto rsu:w-full rsu:max-w-7xl rsu:p-4 rsu:sm:p-6 rsu:lg:p-8",
				className,
				customStyles.container,
			)}
			style={{
				...themeStyles,
				backgroundColor: theme.colors.background,
				color: theme.colors.text,
				borderRadius: theme.borderRadius,
				minHeight: "600px",
			}}
		>
			{showSteps && (
				<div className="rsu:mb-6 rsu:w-full rsu:sm:mb-8">
					<nav className="rsu:flex rsu:w-full rsu:flex-wrap rsu:gap-2 rsu:overflow-x-auto rsu:overflow-y-hidden rsu:sm:flex-nowrap rsu:sm:gap-0 rsu:sm:space-x-6 rsu:lg:space-x-8">
						{steps.map((step: (typeof steps)[0], index: number) => {
							const StepButton =
								customComponents.Button || "button";

							return (
								<StepButton
									type="button"
									key={step.key}
									onClick={() => {
										if (step.accessible) {
											setCurrentStep(
												step.key as
													| "upload"
													| "preview"
													| "mapping"
													| "validation"
													| "editor"
													| "result",
											);
										}
									}}
									disabled={!step.accessible}
									className={clsx(
										"rsu:flex rsu:min-h-[44px] rsu:flex-shrink-0 rsu:items-center rsu:space-x-1 rsu:whitespace-nowrap rsu:border-b-2 rsu:px-2 rsu:py-2 rsu:font-medium rsu:text-xs rsu:transition-all rsu:duration-200 rsu:sm:space-x-2 rsu:sm:px-3 rsu:sm:py-3 rsu:sm:text-sm",
										!step.accessible
											? "rsu:cursor-not-allowed rsu:opacity-50"
											: currentStep === step.key
												? "rsu:scale-105 rsu:text-current"
												: step.completed
													? "rsu:hover:scale-102 rsu:hover:opacity-80"
													: "rsu:border-transparent rsu:hover:scale-102 rsu:hover:opacity-80",
										customStyles.button,
									)}
									style={{
										borderBottomColor: !step.accessible
											? theme.colors.secondary
											: currentStep === step.key
												? theme.colors.primary
												: step.completed
													? theme.colors.success
													: "transparent",
										color: !step.accessible
											? theme.colors.textSecondary
											: currentStep === step.key
												? theme.colors.primary
												: step.completed
													? theme.colors.success
													: theme.colors
															.textSecondary,
									}}
								>
									<div
										className={clsx(
											"rsu:flex rsu:h-5 rsu:w-5 rsu:items-center rsu:justify-center rsu:rounded-full rsu:font-bold rsu:text-xs rsu:transition-all rsu:duration-200 rsu:sm:h-6 rsu:sm:w-6",
										)}
										style={{
											backgroundColor: !step.accessible
												? `${theme.colors.secondary}20`
												: currentStep === step.key
													? `${theme.colors.primary}20`
													: step.completed
														? `${theme.colors.success}20`
														: `${theme.colors.secondary}20`,
											color: !step.accessible
												? theme.colors.textSecondary
												: currentStep === step.key
													? theme.colors.primary
													: step.completed
														? theme.colors.success
														: theme.colors
																.textSecondary,
										}}
									>
										{step.completed ? "✓" : index + 1}
									</div>
									<span className="rsu:hidden rsu:sm:inline">
										{step.label}
									</span>
								</StepButton>
							);
						})}
					</nav>
				</div>
			)}

			<div className="rsu:flex rsu:min-h-[400px] rsu:w-full rsu:items-start rsu:justify-center rsu:sm:min-h-[500px]">
				<div className="rsu:w-full rsu:max-w-none">
					{renderStepContent()}
				</div>
			</div>

			{data && (
				<div className="rsu:mt-8 rsu:flex rsu:w-full rsu:items-center rsu:justify-between rsu:border-t rsu:pt-4">
					<div className="rsu:text-gray-500 rsu:text-sm">
						{t("common.fileInfo", {
							fileName: data.fileName,
							rows: data.totalRows,
							columns: data.totalColumns,
						})}
					</div>
					<div className="rsu:space-x-2">
						<ButtonComponent
							onClick={handleClear}
							className={clsx(
								"rsu:inline-flex rsu:items-center rsu:border rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm rsu:transition-colors",
								customStyles.button,
							)}
							style={{
								borderRadius: theme.borderRadius,
								borderColor: theme.colors.secondary,
								backgroundColor: theme.colors.surface,
								color: theme.colors.text,
								boxShadow: theme.shadows.sm,
							}}
						>
							{t("actions.clear")}
						</ButtonComponent>
						{currentStep !== "upload" && (
							<ButtonComponent
								onClick={() => setCurrentStep("upload")}
								className={clsx(
									"rsu:inline-flex rsu:items-center rsu:border rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm rsu:transition-colors",
									customStyles.button,
								)}
								style={{
									borderRadius: theme.borderRadius,
									borderColor: theme.colors.primary,
									backgroundColor: theme.colors.primary,
									color: theme.colors.surface,
									boxShadow: theme.shadows.sm,
								}}
							>
								{t("actions.back")}
							</ButtonComponent>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
