"use client";

import clsx from "clsx";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "../../i18n";
import type {
	CellData,
	ColumnMapping as ColumnMappingType,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
} from "../../types";

export interface DataEditorProps extends CustomizableComponentProps {
	data: SpreadsheetData;
	mappings: ColumnMappingType[];
	onDataChange: (data: SpreadsheetData) => void;
	onCellEdit?: (row: number, column: number, value: unknown) => void;
	editable?: boolean;
	maxRows?: number;
	maxColumns?: number;
	showRowNumbers?: boolean;
	showColumnHeaders?: boolean;
	validationResult?: import("../../types").ValidationResult;
	i18n?: Partial<I18nConfig>;
}

type RowFilterType = "all" | "errorsOnly";

export function DataEditor({
	data,
	mappings,
	onDataChange,
	onCellEdit,
	editable = true,
	maxRows = 50,
	maxColumns = 20,
	showRowNumbers = true,
	showColumnHeaders = true,
	validationResult,
	i18n,
	theme,
	className = "",
	customComponents = {},
	customStyles = {},
}: DataEditorProps) {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);
	const [editingCell, setEditingCell] = useState<{
		row: number;
		column: number;
	} | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const [rowFilter, setRowFilter] = useState<RowFilterType>("all");
	// const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const inputRef = useRef<HTMLInputElement>(null);

	const TableComponent = customComponents.Table || "table";
	const InputComponent = customComponents.Input || "input";
	const SelectComponent = customComponents.Select || "select";

	const getErrorRows = useCallback(() => {
		if (!validationResult) {
			return new Set(
				data.rows
					.map((row, index) => ({ row, index }))
					.filter(({ row }) =>
						row.some((cell) => cell.isValid === false)
					)
					.map(({ index }) => index)
			);
		}

		const errorRows = new Set<number>();
		validationResult.errors.forEach((error) => {
			errorRows.add(error.row);
		});
		return errorRows;
	}, [validationResult, data.rows]);

	const errorRows = getErrorRows();
	const errorRowCount = errorRows.size;

	// Create mapped data for display
	const mappedData = useMemo(() => {
		const displayMappings = mappings.slice(0, maxColumns);

		return {
			headers: displayMappings.map(
				(mapping: ColumnMappingType) => mapping.targetLabel
			),
			rows: data.rows
				.slice(0, maxRows)
				.map((originalRow: CellData[], _rowIndex: number) => {
					return displayMappings.map((mapping: ColumnMappingType) => {
						const originalCell = originalRow[mapping.sourceIndex];
						return {
							...originalCell,
							// Update error to reference the mapped field instead of original column
							error: originalCell?.error
								? `${originalCell.error} (Campo: ${mapping.targetLabel})`
								: originalCell?.error,
						};
					});
				}),
		};
	}, [data.rows, mappings, maxRows, maxColumns]);

	// Filter rows based on the selected filter (based on original data)
	const getFilteredRows = useCallback(() => {
		if (rowFilter === "all") {
			return mappedData.rows;
		}

		if (rowFilter === "errorsOnly") {
			// Get all row indices that have errors
			const allErrorRowIndices = Array.from(errorRows);

			// Take only the first maxRows error rows
			const errorRowIndices = allErrorRowIndices.slice(0, maxRows);

			// Map the error rows to display format
			return errorRowIndices.map((rowIndex) => {
				const row = data.rows[rowIndex];
				return mappings
					.slice(0, maxColumns)
					.map((mapping: ColumnMappingType) => {
						const originalCell = row[mapping.sourceIndex];
						return {
							...originalCell,
							error: originalCell?.error
								? `${originalCell.error} (Campo: ${mapping.targetLabel})`
								: originalCell?.error,
						};
					});
			});
		}

		return mappedData.rows;
	}, [
		mappedData.rows,
		rowFilter,
		data.rows,
		mappings,
		maxRows,
		maxColumns,
		errorRows,
	]);

	// Get original row indices for filtered rows
	const getOriginalRowIndices = useCallback(() => {
		if (rowFilter === "all") {
			// For "all" filter, we show the first maxRows rows
			return Array.from(
				{ length: Math.min(maxRows, data.rows.length) },
				(_, i) => i
			);
		}

		if (rowFilter === "errorsOnly") {
			// Return indices of the first maxRows error rows
			return Array.from(errorRows).slice(0, maxRows);
		}

		return [];
	}, [data.rows, rowFilter, maxRows, errorRows]);

	const displayData = {
		headers: mappedData.headers,
		rows: getFilteredRows(),
		originalIndices: getOriginalRowIndices(),
	};

	const handleRowFilterChange = useCallback((newFilter: RowFilterType) => {
		setRowFilter(newFilter);
	}, []);

	useEffect(() => {
		if (editingCell && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [editingCell]);

	const handleCellClick = useCallback(
		(displayRow: number, column: number, cell: CellData) => {
			if (!editable) return;

			// Convert display row to original row index
			const originalRow =
				rowFilter !== "all"
					? displayData.originalIndices[displayRow]
					: displayRow;
			setEditingCell({ row: originalRow, column });
			setEditValue(cell.formatted || "");
		},
		[editable, rowFilter, displayData.originalIndices]
	);

	const handleCellDoubleClick = useCallback(
		(displayRow: number, column: number, cell: CellData) => {
			if (!editable) return;

			// Convert display row to original row index
			const originalRow =
				rowFilter !== "all"
					? displayData.originalIndices[displayRow]
					: displayRow;
			setEditingCell({ row: originalRow, column });
			setEditValue(cell.formatted || "");
		},
		[editable, rowFilter, displayData.originalIndices]
	);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setEditValue(event.target.value);
		},
		[]
	);

	const handleSaveEdit = useCallback(() => {
		if (!editingCell) return;

		const { row, column } = editingCell;

		// Get the mapping for the current column
		const displayMappings = mappings.slice(0, maxColumns);
		const currentMapping = displayMappings[column];

		if (!currentMapping) return;

		const newData = { ...data };

		// Update the original cell data
		const originalColumnIndex = currentMapping.sourceIndex;
		if (newData.rows[row]?.[originalColumnIndex]) {
			newData.rows[row] = [...newData.rows[row]];
			newData.rows[row][originalColumnIndex] = {
				...newData.rows[row][originalColumnIndex],
				value: editValue,
				formatted: editValue,
				isValid: true,
				error: undefined,
			};
		}

		onDataChange(newData);

		if (onCellEdit) {
			onCellEdit(row, originalColumnIndex, editValue);
		}

		setEditingCell(null);
		setEditValue("");
	}, [
		editingCell,
		editValue,
		data,
		onDataChange,
		onCellEdit,
		mappings,
		maxColumns,
	]);

	const handleCancelEdit = useCallback(() => {
		setEditingCell(null);
		setEditValue("");
	}, []);

	const handleInputKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Enter") {
				handleSaveEdit();
			} else if (event.key === "Escape") {
				handleCancelEdit();
			}
		},
		[handleSaveEdit, handleCancelEdit]
	);

	const handleInputBlur = useCallback(() => {
		// Small delay to allow for click events to be processed
		setTimeout(() => {
			if (editingCell) {
				handleSaveEdit();
			}
		}, 100);
	}, [editingCell, handleSaveEdit]);

	const getCellClassName = useCallback(
		(cell: CellData, row: number, column: number) => {
			const baseClasses =
				"rsu:px-3 rsu:py-2 rsu:text-sm rsu:border-r rsu:border-b";
			const editableClasses = editable ? "rsu:cursor-pointer" : "";
			const invalidClasses = cell.isValid === false ? "" : "";
			const editingClasses =
				editingCell?.row === row && editingCell?.column === column
					? ""
					: "";

			return `${baseClasses} ${editableClasses} ${invalidClasses} ${editingClasses} ${
				customStyles.cell || ""
			}`;
		},
		[editable, editingCell, customStyles.cell]
	);

	const getCellStyle = useCallback(
		(cell: CellData, row: number, column: number) => {
			const isEditing =
				editingCell?.row === row && editingCell?.column === column;
			const isInvalid = cell.isValid === false;

			return {
				color: isInvalid
					? theme?.colors.error || "#EF4444"
					: theme?.colors.text || "#1F2937",
				backgroundColor: isEditing
					? `${theme?.colors.primary || "#3B82F6"}20`
					: isInvalid
					? `${theme?.colors.error || "#EF4444"}10`
					: editable
					? theme?.colors.surface || "#FFFFFF"
					: `${theme?.colors.secondary || "#6B7280"}05`,
				borderColor: theme?.colors.secondary || "#6B7280",
			};
		},
		[editingCell, theme, editable]
	);

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-4 rsu:sm:space-y-6",
				className,
				customStyles.container
			)}
		>
			<div className="rsu:flex rsu:flex-col rsu:items-start rsu:justify-between rsu:gap-4 rsu:sm:flex-row rsu:sm:items-center">
				<div className="rsu:flex rsu:items-center rsu:space-x-4">
					<h3
						className="rsu:font-semibold rsu:text-lg"
						style={{ color: theme?.colors.text || "#1F2937" }}
					>
						{t("editor.title")}
					</h3>
					<div className="rsu:flex rsu:items-center rsu:space-x-2">
						<span
							className="rsu:font-medium rsu:text-sm"
							style={{
								color: theme?.colors.textSecondary || "#6B7280",
							}}
						>
							{t("editor.filterLabel")}
						</span>
						<SelectComponent
							value={rowFilter}
							onChange={(e) =>
								handleRowFilterChange(
									e.target.value as RowFilterType
								)
							}
							className={`rsu:block rsu:rounded-md rsu:border-gray-300 rsu:text-sm rsu:shadow-sm rsu:focus:border-blue-500 rsu:focus:ring-blue-500 ${
								customStyles.select || ""
							}`}
						>
							<option value="all">
								{t("editor.filter.all")}
							</option>
							<option value="errorsOnly">
								{t("editor.filter.errorsOnly")}
								{errorRowCount > 0 && ` (${errorRowCount})`}
							</option>
						</SelectComponent>
					</div>
				</div>
				{editable && rowFilter === "all" && (
					<div className="rsu:text-gray-500 rsu:text-sm">
						{t("editor.clickToEdit")}
					</div>
				)}
			</div>

			<div
				className="rsu:max-h-[300px] rsu:overflow-auto rsu:rounded-lg rsu:border rsu:sm:max-h-96"
				style={{
					borderRadius: theme?.borderRadius || "0.375rem",
					borderColor: theme?.colors.secondary || "#6B7280",
				}}
			>
				<TableComponent
					className={`rsu:min-w-full rsu:divide-y ${
						customStyles.table || ""
					}`}
					style={{
						borderCollapse: "separate",
						borderSpacing: 0,
					}}
				>
					{showColumnHeaders && (
						<thead
							className="rsu:sticky rsu:top-0 rsu:z-10"
							style={{
								backgroundColor:
									theme?.colors.surface || "#FFFFFF",
							}}
						>
							<tr>
								{showRowNumbers && (
									<th
										className={`rsu:border-r rsu:border-b rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-xs rsu:uppercase rsu:tracking-wider ${
											customStyles.header || ""
										}`}
										style={{
											backgroundColor: `${
												theme?.colors.secondary ||
												"#6B7280"
											}10`,
											borderColor:
												theme?.colors.secondary ||
												"#6B7280",
											color:
												theme?.colors.textSecondary ||
												"#6B7280",
										}}
									>
										#
									</th>
								)}
								{displayData.headers.map(
									(header: string, index: number) => (
										<th
											key={`header-${index}-${header}`}
											className={`rsu:border-r rsu:border-b rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-xs rsu:uppercase rsu:tracking-wider ${
												customStyles.header || ""
											}`}
											style={{
												backgroundColor: `${
													theme?.colors.secondary ||
													"#6B7280"
												}10`,
												borderColor:
													theme?.colors.secondary ||
													"#6B7280",
												color:
													theme?.colors
														.textSecondary ||
													"#6B7280",
											}}
										>
											{header}
										</th>
									)
								)}
							</tr>
						</thead>
					)}
					<tbody
						className="rsu:divide-y"
						style={{
							backgroundColor: theme?.colors.surface || "#FFFFFF",
							borderColor: theme?.colors.secondary || "#6B7280",
						}}
					>
						{displayData.rows.map(
							(row: CellData[], displayRowIndex: number) => {
								// Get original row index
								const originalRowIndex =
									rowFilter !== "all"
										? displayData.originalIndices[
												displayRowIndex
										  ]
										: displayRowIndex;

								return (
									<tr
										key={`row-${originalRowIndex}-${displayRowIndex}-${row
											.map((cell) => cell.value)
											.join("-")}`}
										className="rsu:transition-colors"
									>
										{showRowNumbers && (
											<td
												className="rsu:border-r rsu:border-b rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm"
												style={{
													backgroundColor: `${
														theme?.colors
															.secondary ||
														"#6B7280"
													}05`,
													borderColor:
														theme?.colors
															.secondary ||
														"#6B7280",
													color:
														theme?.colors
															.textSecondary ||
														"#6B7280",
												}}
											>
												{originalRowIndex + 1}
											</td>
										)}
										{row.map(
											(
												cell: CellData,
												columnIndex: number
											) => (
												<td
													key={`cell-${originalRowIndex}-${columnIndex}-${cell.value}`}
													className={getCellClassName(
														cell,
														originalRowIndex,
														columnIndex
													)}
													style={getCellStyle(
														cell,
														originalRowIndex,
														columnIndex
													)}
													onClick={() =>
														handleCellClick(
															displayRowIndex,
															columnIndex,
															cell
														)
													}
													onDoubleClick={() =>
														handleCellDoubleClick(
															displayRowIndex,
															columnIndex,
															cell
														)
													}
													onKeyDown={(event) => {
														if (
															event.key ===
																"Enter" ||
															event.key === " "
														) {
															event.preventDefault();
															handleCellClick(
																displayRowIndex,
																columnIndex,
																cell
															);
														}
													}}
													title={
														cell.error ||
														cell.formatted
													}
												>
													{editingCell?.row ===
														originalRowIndex &&
													editingCell?.column ===
														columnIndex ? (
														<InputComponent
															ref={inputRef}
															type="text"
															value={editValue}
															onChange={
																handleInputChange
															}
															onKeyDown={
																handleInputKeyDown
															}
															onBlur={
																handleInputBlur
															}
															className="rsu:w-full rsu:border-0 rsu:bg-transparent rsu:text-sm rsu:outline-none"
														/>
													) : (
														<span
															className={
																cell.isValid ===
																false
																	? "rsu:text-red-700"
																	: ""
															}
														>
															{cell.formatted ||
																""}
														</span>
													)}
												</td>
											)
										)}
									</tr>
								);
							}
						)}
					</tbody>
				</TableComponent>
			</div>

			{(data.totalRows > maxRows ||
				data.totalColumns > maxColumns ||
				rowFilter !== "all") && (
				<div className="rsu:text-center rsu:text-gray-500 rsu:text-sm">
					<p>
						{rowFilter === "errorsOnly"
							? t("editor.displayingErrors", {
									count: displayData.rows.length,
									total: errorRowCount,
							  })
							: t("editor.displayingRows", {
									shown: maxRows,
									total: data.totalRows,
									columns: maxColumns,
							  })}
					</p>
				</div>
			)}

			{editingCell && (
				<div className="rsu:flex rsu:items-center rsu:space-x-2 rsu:text-gray-600 rsu:text-sm">
					<span>
						{t("editor.editingCell", {
							row: editingCell.row + 1,
							column: editingCell.column + 1,
						})}
					</span>
					<span>•</span>
					<span>{t("editor.keyboardHelp")}</span>
				</div>
			)}
		</div>
	);
}
