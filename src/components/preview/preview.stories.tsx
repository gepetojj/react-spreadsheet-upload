import type { Meta, StoryObj } from "@storybook/react-vite";

import type { SpreadsheetData } from "../../types";
import { Preview } from "./preview";

// Mock data for stories
const mockData: SpreadsheetData = {
	headers: ["Nome", "Email", "Idade", "Ativo", "Data Nascimento"],
	rows: [
		[
			{
				value: "João Silva",
				formatted: "João Silva",
				type: "string",
				isValid: true,
			},
			{
				value: "joao@email.com",
				formatted: "joao@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 30, formatted: "30", type: "number", isValid: true },
			{ value: true, formatted: "Sim", type: "boolean", isValid: true },
			{
				value: "1990-01-15",
				formatted: "15/01/1990",
				type: "date",
				isValid: true,
			},
		],
		[
			{
				value: "Maria Santos",
				formatted: "Maria Santos",
				type: "string",
				isValid: true,
			},
			{
				value: "maria@email.com",
				formatted: "maria@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 25, formatted: "25", type: "number", isValid: true },
			{ value: false, formatted: "Não", type: "boolean", isValid: true },
			{
				value: "1995-05-20",
				formatted: "20/05/1995",
				type: "date",
				isValid: true,
			},
		],
		[
			{
				value: "Pedro Costa",
				formatted: "Pedro Costa",
				type: "string",
				isValid: true,
			},
			{
				value: "pedro@email.com",
				formatted: "pedro@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 35, formatted: "35", type: "number", isValid: true },
			{ value: true, formatted: "Sim", type: "boolean", isValid: true },
			{
				value: "1985-12-10",
				formatted: "10/12/1985",
				type: "date",
				isValid: true,
			},
		],
		[
			{
				value: "Ana Oliveira",
				formatted: "Ana Oliveira",
				type: "string",
				isValid: true,
			},
			{
				value: "ana@email.com",
				formatted: "ana@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 28, formatted: "28", type: "number", isValid: true },
			{ value: true, formatted: "Sim", type: "boolean", isValid: true },
			{
				value: "1992-08-03",
				formatted: "03/08/1992",
				type: "date",
				isValid: true,
			},
		],
		[
			{
				value: "Carlos Lima",
				formatted: "Carlos Lima",
				type: "string",
				isValid: true,
			},
			{
				value: "carlos@email.com",
				formatted: "carlos@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 42, formatted: "42", type: "number", isValid: true },
			{ value: false, formatted: "Não", type: "boolean", isValid: true },
			{
				value: "1978-03-25",
				formatted: "25/03/1978",
				type: "date",
				isValid: true,
			},
		],
	],
	totalRows: 5,
	totalColumns: 5,
	fileName: "usuarios.csv",
	fileSize: 1024,
	lastModified: new Date("2024-01-15T10:30:00Z"),
};

const mockDataWithErrors: SpreadsheetData = {
	...mockData,
	rows: [
		[
			{
				value: "João Silva",
				formatted: "João Silva",
				type: "string",
				isValid: true,
			},
			{
				value: "joao@email.com",
				formatted: "joao@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 30, formatted: "30", type: "number", isValid: true },
			{ value: true, formatted: "Sim", type: "boolean", isValid: true },
			{
				value: "1990-01-15",
				formatted: "15/01/1990",
				type: "date",
				isValid: true,
			},
		],
		[
			{
				value: "",
				formatted: "",
				type: "string",
				isValid: false,
				error: "Nome é obrigatório",
			},
			{
				value: "email-invalido",
				formatted: "email-invalido",
				type: "string",
				isValid: false,
				error: "Formato de email inválido",
			},
			{
				value: -5,
				formatted: "-5",
				type: "number",
				isValid: false,
				error: "Idade deve ser positiva",
			},
			{ value: true, formatted: "Sim", type: "boolean", isValid: true },
			{
				value: "data-invalida",
				formatted: "data-invalida",
				type: "string",
				isValid: false,
				error: "Formato de data inválido",
			},
		],
		[
			{
				value: "Maria Santos",
				formatted: "Maria Santos",
				type: "string",
				isValid: true,
			},
			{
				value: "maria@email.com",
				formatted: "maria@email.com",
				type: "string",
				isValid: true,
			},
			{ value: 25, formatted: "25", type: "number", isValid: true },
			{ value: false, formatted: "Não", type: "boolean", isValid: true },
			{
				value: "1995-05-20",
				formatted: "20/05/1995",
				type: "date",
				isValid: true,
			},
		],
	],
	totalRows: 3,
};

const meta = {
	title: "Components/Preview",
	component: Preview,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Componente para visualização de dados de planilha com informações do arquivo e tabela editável.",
			},
		},
	},
	argTypes: {
		data: {
			control: { type: "object" },
			description: "Dados da planilha para visualização",
		},
		maxRows: {
			control: { type: "number" },
			description: "Número máximo de linhas a exibir",
		},
		maxColumns: {
			control: { type: "number" },
			description: "Número máximo de colunas a exibir",
		},
		showFileInfo: {
			control: { type: "boolean" },
			description: "Mostrar informações do arquivo",
		},
		onCellClick: { action: "cell-clicked" },
	},
} satisfies Meta<typeof Preview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		data: mockData,
		maxRows: 10,
		maxColumns: 10,
		showFileInfo: true,
		onCellClick: (row: number, column: number, value: unknown) => {
			console.log("Célula clicada:", { row, column, value });
		},
	},
};

export const WithoutFileInfo: Story = {
	args: {
		...Default.args,
		showFileInfo: false,
	},
};

export const LimitedRows: Story = {
	args: {
		...Default.args,
		maxRows: 3,
	},
};

export const LimitedColumns: Story = {
	args: {
		...Default.args,
		maxColumns: 3,
	},
};

export const WithErrors: Story = {
	args: {
		...Default.args,
		data: mockDataWithErrors,
	},
};

export const LargeDataset: Story = {
	args: {
		...Default.args,
		data: {
			...mockData,
			totalRows: 1000,
			totalColumns: 20,
			fileName: "dados_grandes.xlsx",
			fileSize: 2048000,
		},
		maxRows: 5,
		maxColumns: 8,
	},
};
