"use client";

import clsx from "clsx";
import { useMemo } from "react";

import { useI18n } from "../../i18n";
import type {
	CellData,
	CustomizableComponentProps,
	I18nConfig,
	SpreadsheetData,
} from "../../types";

export interface PreviewProps extends CustomizableComponentProps {
	data: SpreadsheetData;
	maxRows?: number;
	maxColumns?: number;
	showFileInfo?: boolean;
	onCellClick?: (row: number, column: number, value: unknown) => void;
	i18n?: Partial<I18nConfig>;
}

export function Preview({
	data,
	maxRows = 10,
	maxColumns = 10,
	showFileInfo = true,
	onCellClick,
	i18n,
	theme,
	className = "",
	customComponents = {},
	customStyles = {},
}: PreviewProps) {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const TableComponent = customComponents.Table || "table";

	const displayData = useMemo(() => {
		const rowsToShow = Math.min(maxRows, data.rows.length);
		const columnsToShow = Math.min(maxColumns, data.headers.length);

		return {
			headers: data.headers.slice(0, columnsToShow),
			rows: data.rows
				.slice(0, rowsToShow)
				.map((row) => row.slice(0, columnsToShow)),
		};
	}, [data, maxRows, maxColumns]);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const handleCellClick = (
		rowIndex: number,
		columnIndex: number,
		cell: CellData
	) => {
		if (onCellClick) {
			onCellClick(rowIndex, columnIndex, cell.value);
		}
	};

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-4 rsu:sm:space-y-6",
				className,
				customStyles.container
			)}
		>
			{showFileInfo && (
				<div
					className="rsu:space-y-2 rsu:p-4"
					style={{
						backgroundColor: `${
							theme?.colors.secondary || "#6B7280"
						}10`,
						borderRadius: theme?.borderRadius || "0.375rem",
					}}
				>
					<h3
						className="rsu:font-semibold rsu:text-lg"
						style={{ color: theme?.colors.text || "#1F2937" }}
					>
						{t("preview.title")}
					</h3>
					<div className="rsu:grid rsu:grid-cols-1 rsu:gap-3 rsu:text-sm rsu:sm:grid-cols-2 rsu:sm:gap-4">
						<div>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("preview.fileName")}
							</span>
							<span
								className="rsu:ml-2"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{data.fileName}
							</span>
						</div>
						<div>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("preview.fileSize")}
							</span>
							<span
								className="rsu:ml-2"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{formatFileSize(data.fileSize)}
							</span>
						</div>
						<div>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("preview.totalRows")}
							</span>
							<span
								className="rsu:ml-2"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{data.totalRows}
							</span>
						</div>
						<div>
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("preview.totalColumns")}
							</span>
							<span
								className="rsu:ml-2"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{data.totalColumns}
							</span>
						</div>
						<div className="rsu:col-span-1 rsu:sm:col-span-2">
							<span
								className="rsu:font-medium"
								style={{
									color: theme?.colors.text || "#1F2937",
								}}
							>
								{t("preview.lastModified")}
							</span>
							<span
								className="rsu:ml-2"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								{formatDate(data.lastModified)}
							</span>
						</div>
					</div>
				</div>
			)}

			<div
				className="rsu:overflow-x-auto rsu:border"
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
					<thead
						style={{
							backgroundColor: `${
								theme?.colors.secondary || "#6B7280"
							}10`,
						}}
					>
						<tr>
							<th
								className="rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-xs rsu:uppercase rsu:tracking-wider"
								style={{
									color:
										theme?.colors.textSecondary ||
										"#6B7280",
								}}
							>
								#
							</th>
							{displayData.headers.map((header, index) => (
								<th
									key={`header-${index}-${header}`}
									className={`rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-xs rsu:uppercase rsu:tracking-wider ${
										customStyles.header || ""
									}`}
									style={{
										color:
											theme?.colors.textSecondary ||
											"#6B7280",
									}}
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody
						className="rsu:divide-y"
						style={{
							backgroundColor: theme?.colors.surface || "#FFFFFF",
							borderColor: theme?.colors.secondary || "#6B7280",
						}}
					>
						{displayData.rows.map((row, rowIndex) => (
							<tr
								key={`row-${rowIndex}-${row
									.map((c) => c.value)
									.join("-")}`}
								className="rsu:transition-colors"
								style={{
									borderColor:
										theme?.colors.secondary || "#6B7280",
								}}
							>
								<td
									className="rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-sm"
									style={{
										color:
											theme?.colors.textSecondary ||
											"#6B7280",
									}}
								>
									{rowIndex + 1}
								</td>
								{row.map((cell, columnIndex) => (
									<td
										key={`cell-${rowIndex}-${columnIndex}-${cell.value}`}
										className={clsx(
											"rsu:px-3 rsu:py-2 rsu:text-sm rsu:transition-colors",
											onCellClick && "rsu:cursor-pointer",
											customStyles.cell
										)}
										style={{
											color:
												cell.isValid === false
													? theme?.colors.error ||
													  "#EF4444"
													: theme?.colors.text ||
													  "#1F2937",
											backgroundColor:
												cell.isValid === false
													? `${
															theme?.colors
																.error ||
															"#EF4444"
													  }10`
													: "transparent",
										}}
										onClick={() =>
											handleCellClick(
												rowIndex,
												columnIndex,
												cell
											)
										}
										onKeyDown={(event) => {
											if (
												onCellClick &&
												(event.key === "Enter" ||
													event.key === " ")
											) {
												event.preventDefault();
												handleCellClick(
													rowIndex,
													columnIndex,
													cell
												);
											}
										}}
										tabIndex={onCellClick ? 0 : -1}
										title={cell.error || cell.formatted}
									>
										{cell.formatted || ""}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</TableComponent>
			</div>

			{(data.totalRows > maxRows || data.totalColumns > maxColumns) && (
				<div className="rsu:text-center rsu:text-gray-500 rsu:text-sm">
					<p>
						{data.totalRows > maxRows && (
							<span>
								{data.totalRows - maxRows}{" "}
								{t("preview.notDisplayedRows")}
							</span>
						)}
						{data.totalRows > maxRows &&
							data.totalColumns > maxColumns &&
							" • "}
						{data.totalColumns > maxColumns && (
							<span>
								{data.totalColumns - maxColumns}{" "}
								{t("preview.notDisplayedColumns")}
							</span>
						)}
					</p>
				</div>
			)}
		</div>
	);
}
