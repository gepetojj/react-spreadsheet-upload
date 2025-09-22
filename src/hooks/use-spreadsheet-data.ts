import { useCallback, useMemo, useState } from "react";

import type {
	ColumnMapping,
	SpreadsheetData,
	ValidationResult,
} from "../types";

// Utility function to transform spreadsheet data to JSON
function transformDataToJSON(
	data: SpreadsheetData,
	mappings: ColumnMapping[]
): Record<string, unknown>[] {
	if (!data || mappings.length === 0) return [];

	return data.rows.map((row) => {
		const transformedRow: Record<string, unknown> = {};

		mappings.forEach((mapping) => {
			const cell = row[mapping.sourceIndex];
			let value: unknown = cell?.value || null;

			// Transform value based on data type
			switch (mapping.dataType) {
				case "number":
					value = value ? Number(value) : null;
					break;
				case "boolean":
					if (typeof value === "string") {
						value = value.toLowerCase() === "true" || value === "1";
					} else if (typeof value === "number") {
						value = value === 1;
					}
					break;
				case "date":
					if (value && typeof value === "string") {
						const date = new Date(value);
						value = Number.isNaN(date.getTime())
							? value
							: date.toISOString();
					}
					break;
			}

			transformedRow[mapping.targetField] = value;
		});

		return transformedRow;
	});
}

export interface UseSpreadsheetDataReturn {
	data: SpreadsheetData | null;
	validationResult: ValidationResult | null;
	columnMappings: ColumnMapping[];
	isLoading: boolean;
	error: string | null;
	transformedData: Record<string, unknown>[] | null;
	setData: (data: SpreadsheetData) => void;
	setValidationResult: (result: ValidationResult) => void;
	setColumnMappings: (mappings: ColumnMapping[]) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearData: () => void;
	updateCell: (rowIndex: number, columnIndex: number, value: unknown) => void;
	addColumnMapping: (mapping: ColumnMapping) => void;
	removeColumnMapping: (sourceIndex: number) => void;
	updateColumnMapping: (
		sourceIndex: number,
		updates: Partial<ColumnMapping>
	) => void;
}

export function useSpreadsheetData(): UseSpreadsheetDataReturn {
	const [data, setData] = useState<SpreadsheetData | null>(null);
	const [validationResult, setValidationResult] =
		useState<ValidationResult | null>(null);
	const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Transform data to JSON format
	const transformedData = useMemo(() => {
		if (!data || columnMappings.length === 0) return null;
		return transformDataToJSON(data, columnMappings);
	}, [data, columnMappings]);

	const updateCell = useCallback(
		(rowIndex: number, columnIndex: number, value: unknown) => {
			if (!data) return;

			setData((prevData) => {
				if (!prevData) return null;

				const newRows = [...prevData.rows];
				if (newRows[rowIndex]?.[columnIndex]) {
					newRows[rowIndex] = [...newRows[rowIndex]];
					newRows[rowIndex][columnIndex] = {
						...newRows[rowIndex][columnIndex],
						value: value as string | number | boolean | null,
						formatted:
							typeof value === "string"
								? value
								: String(value ?? ""),
					};
				}

				return {
					...prevData,
					rows: newRows,
				};
			});
		},
		[data]
	);

	const addColumnMapping = useCallback((mapping: ColumnMapping) => {
		setColumnMappings((prev) => [...prev, mapping]);
	}, []);

	const removeColumnMapping = useCallback((sourceIndex: number) => {
		setColumnMappings((prev) =>
			prev.filter((mapping) => mapping.sourceIndex !== sourceIndex)
		);
	}, []);

	const updateColumnMapping = useCallback(
		(sourceIndex: number, updates: Partial<ColumnMapping>) => {
			setColumnMappings((prev) =>
				prev.map((mapping) =>
					mapping.sourceIndex === sourceIndex
						? { ...mapping, ...updates }
						: mapping
				)
			);
		},
		[]
	);

	const clearData = useCallback(() => {
		setData(null);
		setValidationResult(null);
		setColumnMappings([]);
		setLoading(false);
		setError(null);
	}, []);

	return {
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
		addColumnMapping,
		removeColumnMapping,
		updateColumnMapping,
	};
}
