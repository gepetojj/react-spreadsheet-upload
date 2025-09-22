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
			{
				field: "name",
				label: "Nome",
				dataType: "string",
				columnCandidates: [
					"nome",
					"name",
					"nome completo",
					"nome do cliente",
				],
			},
			{
				field: "email",
				label: "Email",
				dataType: "email",
				columnCandidates: [
					"email",
					"e-mail",
					"email address",
					"correo",
				],
			},
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
	},
};

export const WithRequiredFields: StoryObj<typeof meta> = {
	args: {
		availableFields: [
			{
				field: "name",
				label: "Nome",
				dataType: "string" as const,
				required: true,
				columnCandidates: ["nome", "name", "fullname"],
			},
			{
				field: "email",
				label: "Email",
				dataType: "email" as const,
				required: true,
				columnCandidates: ["email", "e-mail", "mail"],
			},
			{
				field: "phone",
				label: "Telefone",
				dataType: "string" as const,
				required: false,
				columnCandidates: ["telefone", "phone", "celular"],
			},
			{
				field: "age",
				label: "Idade",
				dataType: "number" as const,
				required: false,
				columnCandidates: ["idade", "age", "anos"],
			},
		],
		autoMap: true,
		autoValidate: true,
		showSteps: true,
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
			{
				field: "nome",
				label: "Nome Completo",
				dataType: "string",
				columnCandidates: [
					"nome",
					"name",
					"nome completo",
					"nome do cliente",
					"cliente",
				],
			},
			{
				field: "email",
				label: "E-mail",
				dataType: "email",
				columnCandidates: [
					"email",
					"e-mail",
					"email address",
					"correo",
					"email do cliente",
				],
			},
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
		customStyles: {
			container:
				"border-2 border-dashed border-purple-300 rounded-xl shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50",
			button: "transform hover:scale-105",
			input: "transition-all duration-200 hover:border-purple-400",
			select: "transition-all duration-200 hover:border-purple-400",
			table: "shadow-lg",
			cell: "hover:bg-purple-50 transition-colors duration-150",
			header: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold",
		},
	},
};

export const DarkTheme: Story = {
	args: {
		...Default.args,
		theme: {
			colors: {
				primary: "#60A5FA", // Azul claro para melhor contraste
				secondary: "#6B7280", // Cinza médio
				success: "#34D399", // Verde claro
				warning: "#FBBF24", // Amarelo claro
				error: "#F87171", // Vermelho claro
				background: "#0F172A", // Preto slate
				surface: "#1E293B", // Cinza escuro slate
				text: "#F8FAFC", // Branco quase puro
				textSecondary: "#CBD5E1", // Cinza bem claro
			},
			spacing: {
				xs: "0.125rem",
				sm: "0.25rem",
				md: "0.5rem",
				lg: "1rem",
				xl: "1.5rem",
			},
			borderRadius: "0.25rem",
			shadows: {
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
			},
		},
		customComponents: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Button: ({
				children,
				onClick,
				className,
				disabled,
				...props
			}: // biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			any) => (
				<button
					onClick={onClick}
					disabled={disabled}
					className={`inline-flex items-center justify-center rounded border border-gray-600 bg-gray-800 px-3 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
						disabled ? "cursor-not-allowed opacity-50" : ""
					} ${className || ""}`}
					{...props}
				>
					{children}
				</button>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Input: ({ className, ...props }: any) => (
				<input
					className={`block w-full rounded border-gray-600 bg-gray-800 text-white placeholder-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
						className || ""
					}`}
					{...props}
				/>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Select: ({ className, children, ...props }: any) => (
				<select
					className={`block w-full rounded border-gray-600 bg-gray-800 text-white shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
						className || ""
					}`}
					{...props}
				>
					{children}
				</select>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Table: ({ className, children, ...props }: any) => (
				<table
					className={`min-w-full divide-y divide-gray-600 overflow-hidden rounded border border-gray-600 ${
						className || ""
					}`}
					{...props}
				>
					{children}
				</table>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Loading: ({ className, ...props }: any) => (
				<div
					className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-r-transparent border-solid ${
						className || ""
					}`}
					{...props}
				/>
			),
		},
		customStyles: {
			container:
				"border border-gray-600 rounded-lg shadow-2xl bg-gray-900 text-white",
			button: "hover:transform hover:scale-105 border-gray-500",
			input: "transition-all duration-200 hover:border-gray-500 focus:bg-gray-800",
			select: "transition-all duration-200 hover:border-gray-500 focus:bg-gray-800",
			table: "shadow-xl border-gray-600",
			cell: "hover:bg-gray-800 transition-colors duration-150 text-white",
			header: "bg-gray-800 text-white font-semibold border-b border-gray-600",
		},
	},
};

export const CustomComponentsShowcase: Story = {
	args: {
		...Default.args,
		customComponents: {
			Button: ({
				children,
				onClick,
				className,
				variant = "primary",
				...props
			}: // biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			any) => {
				const baseStyles =
					"duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 font-semibold hover:scale-110 inline-flex items-center justify-center px-6 py-3 rounded-full shadow-lg transform transition-all";
				// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
				const variants: any = {
					primary:
						"bg-gradient-to-r focus:ring-pink-500 from-pink-500 hover:from-pink-600 hover:to-rose-700 text-white to-rose-600",
					secondary:
						"bg-gradient-to-r focus:ring-cyan-500 from-cyan-500 hover:from-cyan-600 hover:to-blue-700 text-white to-blue-600",
					success:
						"bg-gradient-to-r focus:ring-emerald-500 from-emerald-500 hover:from-emerald-600 hover:to-green-700 text-white to-green-600",
					danger: "bg-gradient-to-r focus:ring-red-500 from-red-500 hover:from-red-600 hover:to-pink-700 text-white to-pink-600",
				};

				return (
					<button
						onClick={onClick}
						className={`${baseStyles} ${variants[variant]} ${
							className || ""
						}`}
						{...props}
					>
						{children}
					</button>
				);
			},
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Input: ({ className, error, ...props }: any) => (
				<div className="relative">
					<input
						className={`block w-full rounded-xl border-2 border-indigo-200 bg-white px-4 py-3 placeholder-gray-400 shadow-lg transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:ring-offset-2 ${
							error
								? "border-red-300 placeholder-red-300 focus:border-red-500 focus:ring-red-200"
								: ""
						} ${className || ""}`}
						{...props}
					/>
					{error && (
						<div className="-bottom-6 absolute left-0 font-medium text-red-600 text-sm">
							{error}
						</div>
					)}
				</div>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Select: ({ className, children, ...props }: any) => (
				<div className="relative">
					<select
						className={`block w-full appearance-none rounded-xl border-2 border-indigo-200 bg-white px-4 py-3 pr-10 shadow-lg transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:ring-offset-2 ${
							className || ""
						}`}
						{...props}
					>
						{children}
					</select>
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
						<svg
							aria-hidden="true"
							className="h-5 w-5 text-indigo-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Dropdown arrow</title>
							<path
								d="M19 9l-7 7-7-7"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</div>
				</div>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Table: ({ className, children, ...props }: any) => (
				<div className="overflow-hidden rounded-2xl border-2 border-indigo-100 shadow-2xl">
					<table
						className={`min-w-full divide-y divide-indigo-200 ${
							className || ""
						}`}
						{...props}
					>
						{children}
					</table>
				</div>
			),
			// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
			Loading: ({ className, size = "md", ...props }: any) => {
				// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
				const sizes: any = {
					sm: "h-4 w-4",
					md: "h-8 w-8",
					lg: "h-12 w-12",
				};

				return (
					<div className="flex items-center justify-center">
						<div
							className={`animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 ${
								sizes[size]
							} ${className || ""}`}
							{...props}
						/>
					</div>
				);
			},
		},
		customStyles: {
			container:
				"bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 rounded-3xl shadow-2xl border border-indigo-100",
			button: "backdrop-blur-sm",
			input: "backdrop-blur-sm",
			select: "backdrop-blur-sm",
			table: "backdrop-blur-sm",
			cell: "hover:bg-indigo-50/50 transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
			header: "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-lg shadow-lg",
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
