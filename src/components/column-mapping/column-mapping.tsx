import clsx from "clsx";
import { useCallback, useMemo } from "react";

import { useI18n } from "../../i18n";
import type {
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
} from "../../types";

export interface ColumnMappingProps extends CustomizableComponentProps {
	data: SpreadsheetData;
	mappings: ColumnMappingType[];
	onMappingsChange: (mappings: ColumnMappingType[]) => void;
	availableFields?: Array<{
		field: string;
		label: string;
		dataType: ColumnMappingType["dataType"];
	}>;
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
		if (!autoMapEnabled) return;

		const autoMappings: ColumnMappingType[] = [];

		data.headers.forEach((header, index) => {
			// Try to find a matching field
			const matchingField = availableFields.find(
				(field) =>
					field.label.toLowerCase().includes(header.toLowerCase()) ||
					header.toLowerCase().includes(field.label.toLowerCase())
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

		onMappingsChange(autoMappings);
	}, [data.headers, availableFields, onMappingsChange, autoMapEnabled]);

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-6",
				className,
				customStyles.container
			)}
		>
			<div className="rsu:flex rsu:items-center rsu:justify-between">
				<div>
					<h3 className="rsu:font-semibold rsu:text-gray-900 rsu:text-lg">
						{t("mapping.title")}
					</h3>
					<p className="rsu:text-gray-600 rsu:text-sm">
						{t("mapping.subtitle")}
					</p>
				</div>
				{autoMapEnabled && (
					<ButtonComponent
						type="button"
						onClick={handleAutoMap}
						className={`rsu:inline-flex rsu:items-center rsu:rounded-md rsu:border rsu:border-gray-300 rsu:bg-white rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-gray-700 rsu:text-sm rsu:hover:bg-gray-50 ${
							customStyles.button || ""
						}`}
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

			{/* Mapped Fields */}
			{mappings.length > 0 && (
				<div className="rsu:space-y-3">
					<h4 className="rsu:font-medium rsu:text-gray-900">
						{t("mapping.mappedFields")} ({mappings.length})
					</h4>
					<div className="rsu:space-y-2">
						{mappings.map((mapping) => (
							<div
								key={mapping.sourceIndex}
								className="rsu:flex rsu:items-center rsu:justify-between rsu:rounded-lg rsu:border rsu:border-green-200 rsu:bg-green-50 rsu:p-3"
							>
								<div className="rsu:flex-1">
									<div className="rsu:font-medium rsu:text-gray-900">
										{mapping.sourceName}
									</div>
									<div className="rsu:text-green-700 rsu:text-sm">
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
				<h4 className="rsu:font-medium rsu:text-gray-900">
					{t("mapping.unmappedColumns")} (
					{unmappedColumns.filter((col) => !col.isMapped).length})
				</h4>

				{unmappedColumns.filter((col) => !col.isMapped).length === 0 ? (
					<div className="rsu:rounded-lg rsu:bg-blue-50 rsu:p-4 rsu:text-center">
						<svg
							className="rsu:mx-auto rsu:h-12 rsu:w-12 rsu:text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="All fields mapped"
						>
							<title>All fields mapped</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<p className="rsu:mt-2 rsu:font-medium rsu:text-blue-800">
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
									className="rsu:flex rsu:items-center rsu:space-x-4 rsu:rounded-lg rsu:border rsu:border-gray-200 rsu:bg-white rsu:p-3"
								>
									<div className="rsu:flex-1">
										<div className="rsu:font-medium rsu:text-gray-900">
											{column.header}
										</div>
										<div className="rsu:text-gray-500 rsu:text-sm">
											{t("mapping.selectField")}
										</div>
									</div>
									<div className="rsu:min-w-48">
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
											className={`rsu:block rsu:w-full rsu:rounded-md rsu:border-gray-300 rsu:shadow-sm rsu:focus:border-blue-500 rsu:focus:ring-blue-500 ${
												customStyles.select || ""
											}`}
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
			<div className="rsu:rounded-lg rsu:bg-gray-50 rsu:p-4">
				<div className="rsu:text-gray-600 rsu:text-sm">
					<p className="rsu:mb-2 rsu:font-medium">
						{t("mapping.helpTitle")}
					</p>
					<ul className="rsu:space-y-1 rsu:text-sm">
						<li>• {t("mapping.help1")}</li>
						<li>• {t("mapping.help2")}</li>
						<li>• {t("mapping.help3")}</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
