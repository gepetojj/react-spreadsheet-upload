import { useCallback } from "react";

import { useI18n } from "../i18n";
import type {
	ColumnMapping,
	I18nConfig,
	SpreadsheetData,
	ValidationResult,
	ValidationRule,
} from "../types";

export interface UseValidationReturn {
	validateData: (
		data: SpreadsheetData,
		mappings: ColumnMapping[],
	) => ValidationResult;
	validateCell: (
		value: unknown,
		rules: ValidationRule[],
	) => { isValid: boolean; error?: string };
	validateRequired: (value: unknown) => boolean;
	validateMinLength: (value: string, minLength: number) => boolean;
	validateMaxLength: (value: string, maxLength: number) => boolean;
	validatePattern: (value: string, pattern: RegExp) => boolean;
	validateMin: (value: number, min: number) => boolean;
	validateMax: (value: number, max: number) => boolean;
	validateEmail: (value: string) => boolean;
	validateUrl: (value: string) => boolean;
}

export function useValidation(i18n?: Partial<I18nConfig>): UseValidationReturn {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);
	const validateRequired = useCallback((value: unknown): boolean => {
		return value !== null && value !== undefined && value !== "";
	}, []);

	const validateMinLength = useCallback(
		(value: string, minLength: number): boolean => {
			return value.length >= minLength;
		},
		[],
	);

	const validateMaxLength = useCallback(
		(value: string, maxLength: number): boolean => {
			return value.length <= maxLength;
		},
		[],
	);

	const validatePattern = useCallback(
		(value: string, pattern: RegExp): boolean => {
			return pattern.test(value);
		},
		[],
	);

	const validateMin = useCallback((value: number, min: number): boolean => {
		return value >= min;
	}, []);

	const validateMax = useCallback((value: number, max: number): boolean => {
		return value <= max;
	}, []);

	const validateEmail = useCallback((value: string): boolean => {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailPattern.test(value);
	}, []);

	const validateUrl = useCallback((value: string): boolean => {
		try {
			new URL(value);
			return true;
		} catch {
			return false;
		}
	}, []);

	const validateCell = useCallback(
		(
			value: unknown,
			rules: ValidationRule[],
		): { isValid: boolean; error?: string } => {
			for (const rule of rules) {
				let isValid = true;

				switch (rule.type) {
					case "required":
						isValid = validateRequired(value);
						break;
					case "minLength":
						isValid =
							typeof value === "string" &&
							validateMinLength(value, rule.value as number);
						break;
					case "maxLength":
						isValid =
							typeof value === "string" &&
							validateMaxLength(value, rule.value as number);
						break;
					case "pattern":
						isValid =
							typeof value === "string" &&
							validatePattern(value, rule.value as RegExp);
						break;
					case "min":
						isValid =
							typeof value === "number" &&
							validateMin(value, rule.value as number);
						break;
					case "max":
						isValid =
							typeof value === "number" &&
							validateMax(value, rule.value as number);
						break;
					case "custom":
						isValid = rule.validator ? rule.validator(value) : true;
						break;
				}

				if (!isValid) {
					return { isValid: false, error: rule.message };
				}
			}

			return { isValid: true };
		},
		[
			validateRequired,
			validateMinLength,
			validateMaxLength,
			validatePattern,
			validateMin,
			validateMax,
		],
	);

	const validateData = useCallback(
		(
			data: SpreadsheetData,
			mappings: ColumnMapping[],
		): ValidationResult => {
			const errors: ValidationResult["errors"] = [];
			const warnings: ValidationResult["warnings"] = [];

			// Create a map of column mappings for quick lookup
			const mappingMap = new Map<number, ColumnMapping>();
			mappings.forEach((mapping) => {
				mappingMap.set(mapping.sourceIndex, mapping);
			});

			// Validate each cell
			data.rows.forEach((row, rowIndex) => {
				row.forEach((cell, columnIndex) => {
					const mapping = mappingMap.get(columnIndex);

					if (mapping?.validation) {
						const validation = validateCell(
							cell.value,
							mapping.validation,
						);

						if (!validation.isValid && validation.error) {
							errors.push({
								row: rowIndex,
								column: columnIndex,
								field: mapping.targetField,
								message: validation.error,
								value: cell.value,
							});
						}
					}

					// Check for required fields
					if (mapping?.required && !validateRequired(cell.value)) {
						errors.push({
							row: rowIndex,
							column: columnIndex,
							field: mapping.targetField,
							message: `${mapping.targetLabel} ${t(
								"validation.required",
							)}`,
							value: cell.value,
						});
					}

					// Data type specific validations
					if (
						mapping?.dataType &&
						cell.value !== null &&
						cell.value !== undefined &&
						cell.value !== ""
					) {
						switch (mapping.dataType) {
							case "number": {
								const numValue = Number(cell.value);
								if (Number.isNaN(numValue)) {
									errors.push({
										row: rowIndex,
										column: columnIndex,
										field: mapping.targetField,
										message: t("validation.invalidNumber"),
										value: cell.value,
									});
								}
								break;
							}
							case "boolean": {
								const strValue = String(cell.value)
									.toLowerCase()
									.trim();
								if (
									![
										"true",
										"false",
										"1",
										"0",
										"sim",
										"não",
										"yes",
										"no",
									].includes(strValue)
								) {
									errors.push({
										row: rowIndex,
										column: columnIndex,
										field: mapping.targetField,
										message: t("validation.invalidBoolean"),
										value: cell.value,
									});
								}
								break;
							}
							case "date": {
								const dateValue = new Date(String(cell.value));
								if (Number.isNaN(dateValue.getTime())) {
									errors.push({
										row: rowIndex,
										column: columnIndex,
										field: mapping.targetField,
										message: t("validation.invalidDate"),
										value: cell.value,
									});
								}
								break;
							}
							case "email":
								if (
									typeof cell.value === "string" &&
									!validateEmail(cell.value)
								) {
									errors.push({
										row: rowIndex,
										column: columnIndex,
										field: mapping.targetField,
										message: t("validation.invalidEmail"),
										value: cell.value,
									});
								}
								break;
							case "url":
								if (
									typeof cell.value === "string" &&
									!validateUrl(cell.value)
								) {
									errors.push({
										row: rowIndex,
										column: columnIndex,
										field: mapping.targetField,
										message: t("validation.invalidUrl"),
										value: cell.value,
									});
								}
								break;
						}
					}
				});
			});

			return {
				isValid: errors.length === 0,
				errors,
				warnings,
			};
		},
		[validateCell, validateRequired, validateEmail, validateUrl, t],
	);

	return {
		validateData,
		validateCell,
		validateRequired,
		validateMinLength,
		validateMaxLength,
		validatePattern,
		validateMin,
		validateMax,
		validateEmail,
		validateUrl,
	};
}
