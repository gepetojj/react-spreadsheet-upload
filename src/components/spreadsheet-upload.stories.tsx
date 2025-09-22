import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
	ColumnMapping,
	SpreadsheetData,
	ValidationResult,
} from "../types";
import { SpreadsheetUpload } from "./spreadsheet-upload";

const meta = {
	title: "Components/SpreadsheetUpload",
	component: SpreadsheetUpload,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Componente principal para upload, visualização, mapeamento, validação e exportação de planilhas.",
			},
		},
	},
	argTypes: {
		showSteps: {
			control: { type: "boolean" },
			description: "Mostrar navegação por etapas",
		},
		autoValidate: {
			control: { type: "boolean" },
			description:
				"Validar automaticamente quando dados ou mapeamentos mudarem",
		},
		autoMap: {
			control: { type: "boolean" },
			description:
				"Mapear automaticamente colunas baseado nos campos disponíveis",
		},
		uploadOptions: {
			control: { type: "object" },
			description:
				"Opções de upload (formatos aceitos, tamanho máximo, etc.)",
		},
		availableFields: {
			control: { type: "object" },
			description: "Campos disponíveis para mapeamento automático",
		},
	},
} satisfies Meta<typeof SpreadsheetUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		showSteps: true,
		autoValidate: true,
		autoMap: false,
		uploadOptions: {
			acceptedFormats: [".csv", ".xlsx", ".xls"],
			maxFileSize: 10,
			multiple: false,
			autoParse: true,
		},
		availableFields: [
			{ field: "name", label: "Nome", dataType: "string" },
			{ field: "email", label: "Email", dataType: "email" },
			{ field: "age", label: "Idade", dataType: "number" },
			{ field: "active", label: "Ativo", dataType: "boolean" },
			{
				field: "birthDate",
				label: "Data de Nascimento",
				dataType: "date",
			},
		],
		onDataProcessed: (
			data: SpreadsheetData,
			mappings: ColumnMapping[],
			validation: ValidationResult
		) => {
			console.log("Dados processados:", { data, mappings, validation });
		},
		onExport: (data: SpreadsheetData, mappings: ColumnMapping[]) => {
			console.log("Exportando dados:", { data, mappings });
		},
	},
};

export const WithoutSteps: Story = {
	args: {
		...Default.args,
		showSteps: false,
	},
};

export const WithAutoMap: Story = {
	args: {
		...Default.args,
		autoMap: true,
		availableFields: [
			{ field: "nome", label: "Nome Completo", dataType: "string" },
			{ field: "email", label: "E-mail", dataType: "email" },
			{ field: "idade", label: "Idade", dataType: "number" },
			{ field: "ativo", label: "Status Ativo", dataType: "boolean" },
			{
				field: "data_nascimento",
				label: "Data de Nascimento",
				dataType: "date",
			},
			{ field: "telefone", label: "Telefone", dataType: "string" },
			{ field: "endereco", label: "Endereço", dataType: "string" },
		],
	},
};

export const CustomTheme: Story = {
	args: {
		...Default.args,
		theme: {
			colors: {
				primary: "#8B5CF6",
				secondary: "#06B6D4",
				success: "#10B981",
				warning: "#F59E0B",
				error: "#EF4444",
				background: "#F8FAFC",
				surface: "#FFFFFF",
				text: "#1F2937",
				textSecondary: "#6B7280",
			},
			spacing: {
				xs: "0.25rem",
				sm: "0.5rem",
				md: "1rem",
				lg: "1.5rem",
				xl: "2rem",
			},
			borderRadius: "0.5rem",
			shadows: {
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
			},
		},
	},
};

export const EnglishLocale: Story = {
	args: {
		...Default.args,
		i18n: {
			locale: "en-US",
		},
	},
};

export const SpanishLocale: Story = {
	args: {
		...Default.args,
		i18n: {
			locale: "es-ES",
		},
	},
};

export const LargeFileUpload: Story = {
	args: {
		...Default.args,
		uploadOptions: {
			acceptedFormats: [".csv", ".xlsx", ".xls"],
			maxFileSize: 50, // 50MB
			multiple: false,
			autoParse: true,
		},
	},
};

export const CSVOnly: Story = {
	args: {
		...Default.args,
		uploadOptions: {
			acceptedFormats: [".csv"],
			maxFileSize: 5,
			multiple: false,
			autoParse: true,
		},
	},
};

export const ExcelOnly: Story = {
	args: {
		...Default.args,
		uploadOptions: {
			acceptedFormats: [".xlsx", ".xls"],
			maxFileSize: 20,
			multiple: false,
			autoParse: true,
		},
	},
};
