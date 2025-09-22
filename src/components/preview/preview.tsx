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
			className={`rsu:w-full rsu:space-y-4 ${className} ${
				customStyles.container || ""
			}`}
		>
			{showFileInfo && (
				<div className="rsu:space-y-2 rsu:rounded-lg rsu:bg-gray-50 rsu:p-4">
					<h3 className="rsu:font-semibold rsu:text-gray-900 rsu:text-lg">
						{t("preview.title")}
					</h3>
					<div className="rsu:grid rsu:grid-cols-2 rsu:gap-4 rsu:text-sm">
						<div>
							<span className="rsu:font-medium rsu:text-gray-700">
								{t("preview.fileName")}
							</span>
							<span className="rsu:ml-2 rsu:text-gray-600">
								{data.fileName}
							</span>
						</div>
						<div>
							<span className="rsu:font-medium rsu:text-gray-700">
								{t("preview.fileSize")}
							</span>
							<span className="rsu:ml-2 rsu:text-gray-600">
								{formatFileSize(data.fileSize)}
							</span>
						</div>
						<div>
							<span className="rsu:font-medium rsu:text-gray-700">
								{t("preview.totalRows")}
							</span>
							<span className="rsu:ml-2 rsu:text-gray-600">
								{data.totalRows}
							</span>
						</div>
						<div>
							<span className="rsu:font-medium rsu:text-gray-700">
								{t("preview.totalColumns")}
							</span>
							<span className="rsu:ml-2 rsu:text-gray-600">
								{data.totalColumns}
							</span>
						</div>
						<div className="rsu:col-span-2">
							<span className="rsu:font-medium rsu:text-gray-700">
								{t("preview.lastModified")}
							</span>
							<span className="rsu:ml-2 rsu:text-gray-600">
								{formatDate(data.lastModified)}
							</span>
						</div>
					</div>
				</div>
			)}

			<div className="rsu:overflow-x-auto rsu:rounded-lg rsu:border rsu:border-gray-200">
				<TableComponent
					className={`rsu:min-w-full rsu:divide-y rsu:divide-gray-200 ${
						customStyles.table || ""
					}`}
				>
					<thead className="rsu:bg-gray-50">
						<tr>
							<th className="rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-gray-500 rsu:text-xs rsu:uppercase rsu:tracking-wider">
								#
							</th>
							{displayData.headers.map((header, index) => (
								<th
									key={`header-${index}-${header}`}
									className={`rsu:px-3 rsu:py-2 rsu:text-left rsu:font-medium rsu:text-gray-500 rsu:text-xs rsu:uppercase rsu:tracking-wider ${
										customStyles.header || ""
									}`}
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="rsu:divide-y rsu:divide-gray-200 rsu:bg-white">
						{displayData.rows.map((row, rowIndex) => (
							<tr
								key={`row-${rowIndex}-${row
									.map((c) => c.value)
									.join("-")}`}
								className="rsu:hover:bg-gray-50"
							>
								<td className="rsu:px-3 rsu:py-2 rsu:font-medium rsu:text-gray-500 rsu:text-sm">
									{rowIndex + 1}
								</td>
								{row.map((cell, columnIndex) => (
									<td
										key={`cell-${rowIndex}-${columnIndex}-${cell.value}`}
										className={clsx(
											"rsu:px-3 rsu:py-2 rsu:text-gray-900 rsu:text-sm",
											onCellClick &&
												"rsu:cursor-pointer rsu:hover:bg-blue-50",
											cell.isValid === false &&
												"rsu:bg-red-50 rsu:text-red-700",
											customStyles.cell
										)}
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
