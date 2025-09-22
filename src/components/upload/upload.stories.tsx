import type { Meta, StoryObj } from "@storybook/react-vite";

import { Upload } from "./upload";

const meta = {
	title: "Components/Upload",
	component: Upload,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Componente para upload de arquivos de planilha com drag & drop e validação.",
			},
		},
	},
	argTypes: {
		onFileSelect: { action: "file-selected" },
		disabled: {
			control: { type: "boolean" },
			description: "Desabilitar o componente",
		},
		loading: {
			control: { type: "boolean" },
			description: "Mostrar estado de carregamento",
		},
		error: {
			control: { type: "text" },
			description: "Mensagem de erro",
		},
		options: {
			control: { type: "object" },
			description: "Opções de upload",
		},
	},
} satisfies Meta<typeof Upload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		onFileSelect: (file: File) => {
			console.log("Arquivo selecionado:", file.name);
		},
		options: {
			acceptedFormats: [".csv", ".xlsx", ".xls"],
			maxFileSize: 10,
			multiple: false,
			autoParse: true,
		},
	},
};

export const Loading: Story = {
	args: {
		...Default.args,
		loading: true,
	},
};

export const WithError: Story = {
	args: {
		...Default.args,
		error: "Arquivo muito grande. Tamanho máximo permitido: 10MB",
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
};

export const CSVOnly: Story = {
	args: {
		...Default.args,
		options: {
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
		options: {
			acceptedFormats: [".xlsx", ".xls"],
			maxFileSize: 20,
			multiple: false,
			autoParse: true,
		},
	},
};

export const LargeFileSize: Story = {
	args: {
		...Default.args,
		options: {
			acceptedFormats: [".csv", ".xlsx", ".xls"],
			maxFileSize: 100,
			multiple: false,
			autoParse: true,
		},
	},
};
