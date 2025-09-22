import { useCallback, useMemo, useState } from "react";

import {
	useFileParser,
	useSpreadsheetData,
	useValidation as useValidationHook,
} from "../hooks";
import { useI18n } from "../i18n";
import type {
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
	ThemeConfig,
	UploadOptions,
	ValidationResult,
} from "../types";
import { ColumnMapping } from "./column-mapping";
import { DataEditor } from "./data-editor";
import { Preview } from "./preview";
import { Result } from "./result";
import { Upload } from "./upload";
import { Validation } from "./validation";

export interface SpreadsheetUploadProps extends CustomizableComponentProps {
	onDataProcessed?: (
		data: SpreadsheetData,
		mappings: ColumnMappingType[],
		validation: ValidationResult,
		transformedData: Record<string, unknown>[] | null
	) => void;
	uploadOptions?: Partial<UploadOptions>;
	availableFields?: Array<{
		field: string;
		label: string;
		dataType: ColumnMappingType["dataType"];
	}>;
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
	theme: _theme,
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
	const [showErrorsOnly, setShowErrorsOnly] = useState(false);

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
	const { validateData } = useValidationHook();
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const handleFileSelect = useCallback(
		async (file: File) => {
			try {
				setLoading(true);
				setError(null);

				const parsedData = await parseFile(file);
				setData(parsedData);

				if (autoMap && availableFields.length > 0) {
					// Auto-map columns based on available fields
					const autoMappings: ColumnMappingType[] = [];

					parsedData.headers.forEach((header, index) => {
						const matchingField = availableFields.find(
							(field) =>
								field.label
									.toLowerCase()
									.includes(header.toLowerCase()) ||
								header
									.toLowerCase()
									.includes(field.label.toLowerCase())
						);

						if (matchingField) {
							autoMappings.push({
								sourceIndex: index,
								sourceName: header,
								targetField: matchingField.field,
								targetLabel: matchingField.label,
								dataType: matchingField.dataType,
								required: false,
								validation: [],
							});
						}
					});

					setColumnMappings(autoMappings);
				}

				setCurrentStep("preview");
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Erro desconhecido"
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
		]
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
		]
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
		]
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
					transformedData
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

	const steps = useMemo(
		() => [
			{ key: "upload", label: t("actions.upload"), completed: !!data },
			{ key: "preview", label: t("actions.preview"), completed: !!data },
			{
				key: "mapping",
				label: t("actions.map"),
				completed: columnMappings.length > 0,
			},
			{
				key: "validation",
				label: t("actions.validate"),
				completed: !!validationResult,
			},
			{ key: "editor", label: t("actions.edit"), completed: !!data },
			{
				key: "result",
				label: t("actions.result"),
				completed: !!data && columnMappings.length > 0,
			},
		],
		[t, data, columnMappings, validationResult]
	);

	// Navigation logic
	const getNavigationState = useCallback(() => {
		const currentIndex = steps.findIndex(
			(step: (typeof steps)[0]) => step.key === currentStep
		);

		// Can go back: if not on first step
		const canGoBack = currentIndex > 0;

		// Can go forward: if current step is completed or has data
		let canGoForward = false;
		switch (currentStep) {
			case "upload":
				canGoForward = !!data;
				break;
			case "preview":
				canGoForward = columnMappings.length > 0;
				break;
			case "mapping":
				canGoForward = !!validationResult;
				break;
			case "validation":
				canGoForward = !!data;
				break;
			case "editor":
				canGoForward = !!data && columnMappings.length > 0;
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
	}, [currentStep, steps, data, columnMappings, validationResult]);

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
			<div className="rsu:border-t rsu:flex rsu:items-center rsu:justify-between rsu:mt-6 rsu:pt-4">
				<div>
					{navigation.canGoBack && navigation.prevStep && (
						<ButtonComponent
							type="button"
							onClick={() =>
								setCurrentStep(
									navigation.prevStep as typeof currentStep
								)
							}
							className="rsu:border rsu:border-gray-300 rsu:bg-white rsu:hover:bg-gray-50 rsu:inline-flex rsu:items-center rsu:font-medium rsu:px-4 rsu:py-2 rsu:rounded-md rsu:text-gray-700 rsu:text-sm"
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
							className="rsu:border rsu:border-gray-300 rsu:bg-gray-100 rsu:hover:bg-gray-200 rsu:inline-flex rsu:items-center rsu:font-medium rsu:px-4 rsu:py-2 rsu:rounded-md rsu:text-gray-500 rsu:text-sm"
						>
							{t("navigation.skip")}
						</ButtonComponent>
					)}

					{navigation.canGoForward && navigation.nextStep && (
						<ButtonComponent
							type="button"
							onClick={() =>
								setCurrentStep(
									navigation.nextStep as typeof currentStep
								)
							}
							className="rsu:border rsu:border-transparent rsu:bg-blue-600 rsu:hover:bg-blue-700 rsu:inline-flex rsu:items-center rsu:font-medium rsu:px-4 rsu:py-2 rsu:rounded-md rsu:text-sm rsu:text-white"
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
		switch (currentStep) {
			case "upload":
				return (
					<div className="rsu:w-full">
						<Upload
							onFileSelect={handleFileSelect}
							options={uploadOptions}
							loading={isLoading}
							error={error}
							i18n={i18n}
							customComponents={customComponents}
							customStyles={customStyles}
						/>
						<NavigationButtons />
					</div>
				);

			case "preview":
				return data ? (
					<div className="rsu:w-full">
						<Preview
							data={data}
							i18n={i18n}
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
						<NavigationButtons />
					</div>
				) : null;

			case "mapping":
				return data ? (
					<div className="rsu:w-full">
						<ColumnMapping
							data={data}
							mappings={columnMappings}
							onMappingsChange={handleMappingsChange}
							availableFields={availableFields}
							autoMapEnabled={autoMap}
							i18n={i18n}
							customComponents={customComponents}
							customStyles={customStyles}
						/>
						<NavigationButtons />
					</div>
				) : null;

			case "validation":
				return validationResult ? (
					<div className="rsu:w-full">
						<Validation
							validationResult={validationResult}
							i18n={i18n}
							onErrorClick={(error) => {
								console.log("Error clicked:", error);
							}}
							onWarningClick={(warning) => {
								console.log("Warning clicked:", warning);
							}}
							customComponents={customComponents}
							customStyles={customStyles}
						/>
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
						<DataEditor
							data={data}
							mappings={columnMappings}
							i18n={i18n}
							onDataChange={handleDataChange}
							onCellEdit={(row, column, value) => {
								updateCell(row, column, value);
							}}
							showErrorsOnly={showErrorsOnly}
							onShowErrorsOnlyChange={setShowErrorsOnly}
							customComponents={customComponents}
							customStyles={customStyles}
						/>
						<NavigationButtons />
					</div>
				) : null;

			case "result":
				return data ? (
					<div className="rsu:w-full">
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
										transformedData
									);
								}
							}}
							customComponents={customComponents}
							customStyles={customStyles}
						/>
						<NavigationButtons />
					</div>
				) : null;

			default:
				return null;
		}
	};

	const ButtonComponent = customComponents.Button || "button";

	return (
		<div
			className={`rsu:mx-auto rsu:max-w-6xl rsu:p-6 rsu:w-full ${className} ${
				customStyles.container || ""
			}`}
		>
			{showSteps && (
				<div className="rsu:mb-8 rsu:w-full">
					<nav className="rsu:flex rsu:space-x-8 rsu:w-full">
						{steps.map((step: (typeof steps)[0], index: number) => (
							<button
								type="button"
								key={step.key}
								onClick={() =>
									setCurrentStep(
										step.key as
											| "upload"
											| "preview"
											| "mapping"
											| "validation"
											| "editor"
											| "result"
									)
								}
								className={`rsu:flex rsu:items-center rsu:space-x-2 rsu:border-b-2 rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm rsu:transition-colors ${
									currentStep === step.key
										? "rsu:border-blue-600 rsu:text-blue-600"
										: step.completed
										? "rsu:border-green-600 rsu:text-green-600 rsu:hover:text-green-700"
										: "rsu:border-transparent rsu:text-gray-500 rsu:hover:text-gray-700"
								}
                `}
							>
								<div
									className={`rsu:flex rsu:h-6 rsu:w-6 rsu:items-center rsu:justify-center rsu:rounded-full rsu:font-bold rsu:text-xs ${
										currentStep === step.key
											? "rsu:bg-blue-100 rsu:text-blue-600"
											: step.completed
											? "rsu:bg-green-100 rsu:text-green-600"
											: "rsu:bg-gray-100 rsu:text-gray-500"
									}
                `}
								>
									{step.completed ? "✓" : index + 1}
								</div>
								<span>{step.label}</span>
							</button>
						))}
					</nav>
				</div>
			)}

			<div className="rsu:flex rsu:items-center rsu:justify-center rsu:min-h-[500px] rsu:w-full">
				{renderStepContent()}
			</div>

			{data && (
				<div className="rsu:border-t rsu:flex rsu:items-center rsu:justify-between rsu:mt-8 rsu:pt-4 rsu:w-full">
					<div className="rsu:text-gray-500 rsu:text-sm">
						{data.fileName} • {data.totalRows} linhas •{" "}
						{data.totalColumns} colunas
					</div>
					<div className="rsu:space-x-2">
						<ButtonComponent
							onClick={handleClear}
							className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-gray-300 rsu:bg-white rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-gray-700 rsu:text-sm rsu:hover:bg-gray-50"
						>
							{t("actions.clear")}
						</ButtonComponent>
						{currentStep !== "upload" && (
							<ButtonComponent
								onClick={() => setCurrentStep("upload")}
								className="rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-gray-300 rsu:bg-white rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-gray-700 rsu:text-sm rsu:hover:bg-gray-50"
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
