import Papa from "papaparse";
import { useCallback } from "react";
import * as XLSX from "xlsx";

import type { CellData, SpreadsheetData } from "../types";

export interface UseFileParserReturn {
	parseFile: (file: File) => Promise<SpreadsheetData>;
	parseCSV: (file: File) => Promise<SpreadsheetData>;
	parseXLSX: (file: File) => Promise<SpreadsheetData>;
}

export function useFileParser(): UseFileParserReturn {
	const parseCSV = useCallback(
		async (file: File): Promise<SpreadsheetData> => {
			return new Promise((resolve, reject) => {
				Papa.parse(file, {
					header: false,
					skipEmptyLines: true,
					complete: (results) => {
						try {
							const rows = results.data as string[][];
							if (rows.length === 0) {
								throw new Error("Arquivo CSV está vazio");
							}

							const headers = rows[0] || [];
							const dataRows = rows.slice(1);

							const cellData: CellData[][] = dataRows.map((row) =>
								row.map((cell) => ({
									value: cell || null,
									formatted: cell || "",
									type: "string" as const,
									isValid: true,
								}))
							);

							const spreadsheetData: SpreadsheetData = {
								headers,
								rows: cellData,
								totalRows: dataRows.length,
								totalColumns: headers.length,
								fileName: file.name,
								fileSize: file.size,
								lastModified: new Date(file.lastModified),
							};

							resolve(spreadsheetData);
						} catch (error) {
							reject(error);
						}
					},
					error: (error) => {
						reject(
							new Error(`Erro ao processar CSV: ${error.message}`)
						);
					},
				});
			});
		},
		[]
	);

	const parseXLSX = useCallback(
		async (file: File): Promise<SpreadsheetData> => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = (e) => {
					try {
						const data = e.target?.result;
						if (!data) {
							throw new Error("Não foi possível ler o arquivo");
						}

						const workbook = XLSX.read(data, { type: "binary" });
						const sheetName = workbook.SheetNames[0];

						if (!sheetName) {
							throw new Error("Planilha não contém abas");
						}

						const worksheet = workbook.Sheets[sheetName];
						const jsonData = XLSX.utils.sheet_to_json(worksheet, {
							header: 1,
							// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
						}) as any[][];

						if (jsonData.length === 0) {
							throw new Error("Planilha está vazia");
						}

						const headers = jsonData[0]?.map(String) || [];
						const dataRows = jsonData.slice(1);

						const cellData: CellData[][] = dataRows.map((row) =>
							row.map((cell) => {
								let value = cell;
								let type: CellData["type"] = "string";

								if (typeof cell === "number") {
									type = "number";
								} else if (typeof cell === "boolean") {
									type = "boolean";
								} else if (cell instanceof Date) {
									type = "date";
									value = cell.toISOString();
								} else if (
									cell === null ||
									cell === undefined
								) {
									value = null;
								} else {
									value = String(cell);
								}

								return {
									value,
									formatted: String(cell || ""),
									type,
									isValid: true,
								};
							})
						);

						const spreadsheetData: SpreadsheetData = {
							headers,
							rows: cellData,
							totalRows: dataRows.length,
							totalColumns: headers.length,
							fileName: file.name,
							fileSize: file.size,
							lastModified: new Date(file.lastModified),
						};

						resolve(spreadsheetData);
					} catch (error) {
						reject(error);
					}
				};

				reader.onerror = () => {
					reject(new Error("Erro ao ler o arquivo"));
				};

				reader.readAsBinaryString(file);
			});
		},
		[]
	);

	const parseFile = useCallback(
		async (file: File): Promise<SpreadsheetData> => {
			const extension = file.name.split(".").pop()?.toLowerCase();

			switch (extension) {
				case "csv":
					return parseCSV(file);
				case "xlsx":
				case "xls":
					return parseXLSX(file);
				default:
					throw new Error(
						`Formato de arquivo não suportado: ${extension}`
					);
			}
		},
		[parseCSV, parseXLSX]
	);

	return {
		parseFile,
		parseCSV,
		parseXLSX,
	};
}
