"use client";

import clsx from "clsx";
import { useCallback, useMemo } from "react";

import { useI18n } from "../../i18n";
import type {
	AvailableField,
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
} from "../../types";

export interface ColumnMappingProps extends CustomizableComponentProps {
	data: SpreadsheetData;
	mappings: ColumnMappingType[];
	onMappingsChange: (mappings: ColumnMappingType[]) => void;
	availableFields?: AvailableField[];
	autoMapEnabled?: boolean;
	i18n?: Partial<I18nConfig>;
}

export function ColumnMapping({
	data,
	mappings,
	onMappingsChange,
	availableFields = [],
	autoMapEnabled = true,
	i18n,
	theme,
	className = "",
	customComponents = {},
	customStyles = {},
}: ColumnMappingProps) {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const ButtonComponent = customComponents.Button || "button";
	const SelectComponent = customComponents.Select || "select";

	// Get unmapped columns
	const unmappedColumns = useMemo(() => {
		const mappedIndexes = new Set(mappings.map((m) => m.sourceIndex));
		return data.headers.map((header, index) => ({
			index,
			header,
			isMapped: mappedIndexes.has(index),
		}));
	}, [data.headers, mappings]);

	// Get required fields that are not mapped
	const requiredFieldsNotMapped = useMemo(() => {
		const mappedTargetFields = new Set(mappings.map((m) => m.targetField));
		return availableFields.filter(
			(field) => field.required && !mappedTargetFields.has(field.field)
		);
	}, [availableFields, mappings]);

	// Get all required fields
	const requiredFields = useMemo(() => {
		return availableFields.filter((field) => field.required);
	}, [availableFields]);

	// Create mapping for quick lookup
	const mappingMap = useMemo(() => {
		const map = new Map<number, ColumnMappingType>();
		mappings.forEach((mapping) => {
			map.set(mapping.sourceIndex, mapping);
		});
		return map;
	}, [mappings]);

	const handleFieldChange = useCallback(
		(sourceIndex: number, targetField: string) => {
			const fieldConfig = availableFields.find(
				(f) => f.field === targetField
			);

			if (fieldConfig) {
				const newMapping: ColumnMappingType = {
					sourceIndex,
					sourceName: data.headers[sourceIndex] || "",
					targetField: fieldConfig.field,
					targetLabel: fieldConfig.label,
					dataType: fieldConfig.dataType,
					required: false,
					validation: [],
				};

				const updatedMappings = mappings.filter(
					(m) => m.sourceIndex !== sourceIndex
				);
				onMappingsChange([...updatedMappings, newMapping]);
			}
		},
		[mappings, onMappingsChange, data.headers, availableFields]
	);

	const handleRemoveMapping = useCallback(
		(sourceIndex: number) => {
			const updatedMappings = mappings.filter(
				(m) => m.sourceIndex !== sourceIndex
			);
			onMappingsChange(updatedMappings);
		},
		[mappings, onMappingsChange]
	);

	const handleAutoMap = useCallback(() => {
		if (!autoMapEnabled || availableFields.length === 0) return;

		const autoMappings: ColumnMappingType[] = [];

		// Helper function to check if header matches field candidates
		const matchesField = (
			header: string,
			field: AvailableField
		): boolean => {
			// Normalize strings: trim, lowercase, remove accents, and replace multiple spaces
			const normalize = (str: string) =>
				str
					.toLowerCase()
					.trim()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "") // Remove accents
					.replace(/[^\w\s-]/g, "") // Remove special chars except spaces and hyphens
					.replace(/\s+/g, " ");

			const headerNormalized = normalize(header);
			const labelNormalized = normalize(field.label);

			// Priority 1: Exact match with field label
			if (labelNormalized === headerNormalized) {
				return true;
			}

			// Priority 2: Check against column candidates (exact match first)
			if (field.columnCandidates) {
				const exactCandidateMatch = field.columnCandidates.some(
					(candidate) => normalize(candidate) === headerNormalized
				);
				if (exactCandidateMatch) return true;

				// Priority 3: Partial matches with candidates
				const partialCandidateMatch = field.columnCandidates.some(
					(candidate) => {
						const candidateNormalized = normalize(candidate);
						return (
							candidateNormalized.includes(headerNormalized) ||
							headerNormalized.includes(candidateNormalized)
						);
					}
				);
				if (partialCandidateMatch) return true;
			}

			// Priority 4: Partial match with field label
			if (
				labelNormalized.includes(headerNormalized) ||
				headerNormalized.includes(labelNormalized)
			) {
				return true;
			}

			return false;
		};

		// Separate required and optional fields
		const requiredFields = availableFields.filter(
			(field) => field.required
		);
		const optionalFields = availableFields.filter(
			(field) => !field.required
		);

		// Process headers and try to map them
		const processedHeaders = new Set<number>();

		// First, try to map required fields
		data.headers.forEach((header, index) => {
			if (processedHeaders.has(index)) return;

			const matchingRequiredField = requiredFields.find((field) =>
				matchesField(header, field)
			);

			if (matchingRequiredField) {
				autoMappings.push({
					sourceIndex: index,
					sourceName: header,
					targetField: matchingRequiredField.field,
					targetLabel: matchingRequiredField.label,
					dataType: matchingRequiredField.dataType,
					required: matchingRequiredField.required || false,
					validation: [],
				});
				processedHeaders.add(index);
			}
		});

		// Then, try to map optional fields
		data.headers.forEach((header, index) => {
			if (processedHeaders.has(index)) return;

			const matchingOptionalField = optionalFields.find((field) =>
				matchesField(header, field)
			);

			if (matchingOptionalField) {
				autoMappings.push({
					sourceIndex: index,
					sourceName: header,
					targetField: matchingOptionalField.field,
					targetLabel: matchingOptionalField.label,
					dataType: matchingOptionalField.dataType,
					required: matchingOptionalField.required || false,
					validation: [],
				});
				processedHeaders.add(index);
			}
		});

		onMappingsChange(autoMappings);
	}, [data.headers, availableFields, onMappingsChange, autoMapEnabled]);

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-4 rsu:sm:space-y-6",
				className,
				customStyles.container
			)}
		>
			<div className="rsu:flex rsu:flex-col rsu:items-start rsu:justify-between rsu:gap-4 rsu:sm:flex-row rsu:sm:items-center">
				<div>
					<h3
						className="rsu:font-semibold rsu:text-lg"
						style={{ color: theme?.colors.text || "#1F2937" }}
					>
						{t("mapping.title")}
					</h3>
					<p
						className="rsu:text-sm"
						style={{
							color: theme?.colors.textSecondary || "#6B7280",
						}}
					>
						{t("mapping.subtitle")}
					</p>
				</div>
				{autoMapEnabled && (
					<ButtonComponent
						type="button"
						onClick={handleAutoMap}
						className={`rsu:inline-flex rsu:items-center rsu:border rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm rsu:transition-colors ${
							customStyles.button || ""
						}`}
						style={{
							borderRadius: theme?.borderRadius || "0.375rem",
							borderColor: theme?.colors.secondary || "#6B7280",
							backgroundColor: theme?.colors.surface || "#FFFFFF",
							color: theme?.colors.text || "#1F2937",
						}}
					>
						<svg
							className="rsu:mr-2 rsu:h-4 rsu:w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Auto map"
						>
							<title>Auto map</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						{t("mapping.autoMap")}
					</ButtonComponent>
				)}
			</div>

			{/* Required Fields Warning */}
			{requiredFieldsNotMapped.length > 0 && (
				<div className="rsu:rounded-lg rsu:border rsu:border-red-200 rsu:bg-red-50 rsu:p-4">
					<div className="rsu:flex rsu:items-start">
						<svg
							className="rsu:mt-0.5 rsu:h-5 rsu:w-5 rsu:text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Warning"
						>
							<title>Aviso</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
						<div className="rsu:ml-3">
							<h4 className="rsu:font-medium rsu:text-red-800">
								{t("mapping.requiredFieldsMissing")} (
								{requiredFieldsNotMapped.length})
							</h4>
							<p className="rsu:mt-1 rsu:text-red-700 rsu:text-sm">
								{t("mapping.requiredFieldsHelp")}
							</p>
							<div className="rsu:mt-2 rsu:space-y-1">
								{requiredFieldsNotMapped.map((field) => (
									<div
										key={field.field}
										className="rsu:flex rsu:items-center rsu:text-red-700 rsu:text-sm"
									>
										<span className="rsu:font-medium">
											{field.label}
										</span>
										<span className="rsu:ml-1 rsu:text-red-600">
											*
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Required Fields Status */}
			{requiredFields.length > 0 && (
				<div
					className="rsu:p-4"
					style={{
						backgroundColor: `${
							theme?.colors.primary || "#3B82F6"
						}10`,
						borderRadius: theme?.borderRadius || "0.375rem",
					}}
				>
					<h4
						className="rsu:mb-2 rsu:font-medium"
						style={{ color: theme?.colors.primary || "#3B82F6" }}
					>
						{t("mapping.requiredFields")}
					</h4>
					<div className="rsu:space-y-2">
						{requiredFields.map((field) => {
							const isMapped = mappings.some(
								(mapping) => mapping.targetField === field.field
							);
							return (
								<div
									key={field.field}
									className={`rsu:flex rsu:items-center rsu:justify-between rsu:rounded-md rsu:p-2 ${
										isMapped
											? "rsu:bg-green-100 rsu:text-green-800"
											: "rsu:bg-gray-100 rsu:text-gray-700"
									}`}
								>
									<div className="rsu:flex rsu:items-center">
										<span className="rsu:font-medium">
											{field.label}
										</span>
										<span className="rsu:ml-1 rsu:text-red-600">
											*
										</span>
									</div>
									{isMapped ? (
										<svg
											aria-label="Mapped"
											className="rsu:h-4 rsu:w-4 rsu:text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Mapeado</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									) : (
										<svg
											aria-label="Not mapped"
											className="rsu:h-4 rsu:w-4 rsu:text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Não mapeado</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Mapped Fields */}
			{mappings.length > 0 && (
				<div className="rsu:space-y-3">
					<h4
						className="rsu:font-medium"
						style={{ color: theme?.colors.text || "#1F2937" }}
					>
						{t("mapping.mappedFields")} ({mappings.length})
					</h4>
					<div className="rsu:space-y-2">
						{mappings.map((mapping) => (
							<div
								key={mapping.sourceIndex}
								className="rsu:flex rsu:items-center rsu:justify-between rsu:border rsu:p-3"
								style={{
									backgroundColor: `${
										theme?.colors.success || "#10B981"
									}10`,
									borderColor: `${
										theme?.colors.success || "#10B981"
									}30`,
									borderRadius:
										theme?.borderRadius || "0.375rem",
								}}
							>
								<div className="rsu:flex-1">
									<div
										className="rsu:font-medium"
										style={{
											color:
												theme?.colors.text || "#1F2937",
										}}
									>
										{mapping.sourceName}
									</div>
									<div
										className="rsu:text-sm"
										style={{
											color:
												theme?.colors.success ||
												"#10B981",
										}}
									>
										→ {mapping.targetLabel}
									</div>
								</div>
								<ButtonComponent
									type="button"
									onClick={() =>
										handleRemoveMapping(mapping.sourceIndex)
									}
									className="rsu:ml-2 rsu:text-red-600 rsu:hover:text-red-900"
								>
									<svg
										className="rsu:h-4 rsu:w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-label="Remove mapping"
									>
										<title>Remove mapping</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</ButtonComponent>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Unmapped Columns */}
			<div className="rsu:space-y-3">
				<h4
					className="rsu:font-medium"
					style={{ color: theme?.colors.text || "#1F2937" }}
				>
					{t("mapping.unmappedColumns")} (
					{unmappedColumns.filter((col) => !col.isMapped).length})
				</h4>

				{unmappedColumns.filter((col) => !col.isMapped).length === 0 ? (
					<div
						className="rsu:p-4 rsu:text-center"
						style={{
							backgroundColor: `${
								theme?.colors.success || "#10B981"
							}10`,
							borderRadius: theme?.borderRadius || "0.375rem",
						}}
					>
						<svg
							className="rsu:mx-auto rsu:h-12 rsu:w-12"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="All fields mapped"
							style={{
								color: theme?.colors.success || "#10B981",
							}}
						>
							<title>All fields mapped</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<p
							className="rsu:mt-2 rsu:font-medium"
							style={{
								color: theme?.colors.success || "#10B981",
							}}
						>
							{t("mapping.allMapped")}
						</p>
					</div>
				) : (
					<div className="rsu:space-y-3">
						{unmappedColumns
							.filter((col) => !col.isMapped)
							.map((column) => (
								<div
									key={column.index}
									className="rsu:flex rsu:flex-col rsu:items-start rsu:gap-3 rsu:border rsu:p-3 rsu:sm:flex-row rsu:sm:items-center rsu:sm:gap-4 rsu:sm:p-4"
									style={{
										backgroundColor:
											theme?.colors.surface || "#FFFFFF",
										borderColor:
											theme?.colors.secondary ||
											"#6B7280",
										borderRadius:
											theme?.borderRadius || "0.375rem",
									}}
								>
									<div className="rsu:min-w-0 rsu:flex-1">
										<div
											className="rsu:font-medium"
											style={{
												color:
													theme?.colors.text ||
													"#1F2937",
											}}
										>
											{column.header}
										</div>
										<div
											className="rsu:text-sm"
											style={{
												color:
													theme?.colors
														.textSecondary ||
													"#6B7280",
											}}
										>
											{t("mapping.selectField")}
										</div>
									</div>
									<div className="rsu:w-full rsu:flex-shrink-0 rsu:sm:w-48">
										<SelectComponent
											value={
												mappingMap.get(column.index)
													?.targetField || ""
											}
											onChange={(e) =>
												handleFieldChange(
													column.index,
													e.target.value
												)
											}
											className={`rsu:block rsu:w-full rsu:border rsu:shadow-sm rsu:focus:outline-none rsu:focus:ring-2 ${
												customStyles.select || ""
											}`}
											style={{
												borderRadius:
													theme?.borderRadius ||
													"0.375rem",
												borderColor:
													theme?.colors.secondary ||
													"#6B7280",
												backgroundColor:
													theme?.colors.surface ||
													"#FFFFFF",
												color:
													theme?.colors.text ||
													"#1F2937",
											}}
										>
											<option value="">
												{t("mapping.chooseField")}
											</option>
											{availableFields.map((field) => (
												<option
													key={field.field}
													value={field.field}
												>
													{field.label}
													{field.required ? " *" : ""}
												</option>
											))}
										</SelectComponent>
									</div>
								</div>
							))}
					</div>
				)}
			</div>

			{/* Help Text */}
			<div
				className="rsu:p-4"
				style={{
					backgroundColor: `${
						theme?.colors.secondary || "#6B7280"
					}05`,
					borderRadius: theme?.borderRadius || "0.375rem",
				}}
			>
				<div className="rsu:text-sm">
					<p
						className="rsu:mb-2 rsu:font-medium"
						style={{ color: theme?.colors.text || "#1F2937" }}
					>
						{t("mapping.helpTitle")}
					</p>
					<ul
						className="rsu:space-y-1 rsu:text-sm"
						style={{
							color: theme?.colors.textSecondary || "#6B7280",
						}}
					>
						<li>• {t("mapping.help1")}</li>
						<li>• {t("mapping.help2")}</li>
						<li>• {t("mapping.help3")}</li>
						{requiredFields.length > 0 && (
							<li>• {t("mapping.requiredFieldsHelp")}</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
}
