# react-spreadsheet-upload

Biblioteca React completa para upload, visualização, mapeamento de colunas, validação e edição de dados de planilhas (CSV, XLSX). Focada em experiência do usuário fluida, customização total (temas, componentes, estilos) e responsividade nativa.

![GIF demonstrando uso da biblioteca](https://github.com/gepetojj/react-spreadsheet-upload/raw/main/.github/blobs/demo.gif)

## Índice

-   Conceitos rápidos
-   Instalação
-   Exemplo mínimo (end-to-end)
-   Tipos principais (modelo de domínio)
-   Componentes e funcionalidades
-   Tema e customização
-   Validação de dados
-   Exportação de dados
-   Internacionalização (i18n)
-   Hooks personalizados
-   Exemplos avançados
-   API de referência
-   Contribuição e licença

## Conceitos rápidos

-   **Upload**: Drag & drop ou browse com suporte a CSV, XLSX, ODS
-   **Preview**: Visualização paginada com preview de dados antes do processamento
-   **Column Mapping**: Mapeamento inteligente de colunas para campos do sistema
-   **Validation**: Validação automática com regras customizáveis
-   **Data Editor**: Edição inline de células com validação em tempo real
-   **Result**: Feedback final com estatísticas e opções de exportação
-   **Theme**: Sistema completo de temas com cores, espaçamento e componentes customizáveis
-   **Responsive**: Design responsivo nativo para mobile, tablet e desktop

Princípios: zero dependências externas (apenas papaparse, xlsx), tipagem forte, validação "fail fast", extensibilidade controlada, experiência mobile-first.

## Instalação

```sh
npm install react-spreadsheet-upload
# ou
yarn add react-spreadsheet-upload
# ou
pnpm add react-spreadsheet-upload
```

**Dependências peer:**

```json
{
	"react": "^19.1.1",
	"react-dom": "^19.1.1"
}
```

**CSS necessário:**

```js
import "react-spreadsheet-upload/styles.css";
```

## Exemplo mínimo (end-to-end)

Fluxo completo: upload → preview → mapeamento → validação → edição → resultado.

```tsx
import React from "react";
import { SpreadsheetUpload } from "react-spreadsheet-upload";
import "react-spreadsheet-upload/styles.css";

function App() {
	// Campos disponíveis no seu sistema
	const availableFields = [
		{
			field: "name",
			label: "Nome",
			dataType: "string" as const,
			required: true,
		},
		{
			field: "email",
			label: "Email",
			dataType: "email" as const,
			required: true,
		},
		{ field: "age", label: "Idade", dataType: "number" as const },
		{ field: "active", label: "Ativo", dataType: "boolean" as const },
	];

	const handleDataProcessed = (
		data,
		mappings,
		validation,
		transformedData
	) => {
		console.log("Dados processados:", {
			original: data,
			mappings,
			validation,
			transformed: transformedData,
		});
	};

	return (
		<SpreadsheetUpload
			availableFields={availableFields}
			onDataProcessed={handleDataProcessed}
			uploadOptions={{
				acceptedFormats: [".csv", ".xlsx", ".ods"],
				maxFileSize: 10 * 1024 * 1024, // 10MB
				multiple: false,
				autoParse: true,
			}}
			theme={{
				colors: {
					primary: "#3B82F6",
					secondary: "#6B7280",
					success: "#10B981",
					warning: "#F59E0B",
					error: "#EF4444",
					background: "#F9FAFB",
					surface: "#FFFFFF",
					text: "#1F2937",
					textSecondary: "#6B7280",
				},
			}}
			i18n={{
				locale: "pt-BR",
			}}
		/>
	);
}

export default App;
```

## Tipos principais

-   **CellData**: Representa uma célula individual com valor, tipo e estado de validação
-   **ColumnMapping**: Mapeamento entre coluna da planilha e campo do sistema
-   **SpreadsheetData**: Dados completos da planilha processada
-   **ValidationResult**: Resultado da validação com erros e avisos
-   **ThemeConfig**: Configuração completa de cores, espaçamento e sombras
-   **UploadOptions**: Configurações de upload (formatos, tamanho máximo, etc.)
-   **AvailableField**: Campos disponíveis para mapeamento no sistema

Todos os tipos estão exportados e tipados em `src/types/index.ts`.

## Componentes e funcionalidades

### SpreadsheetUpload (componente principal)

Componente orquestrador que gerencia todo o fluxo de upload e processamento.

#### Props principais:

| Prop               | Objetivo                                                                | Funcionamento                                                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `availableFields`  | Define os campos do sistema disponíveis para mapeamento.                | Array de objetos `AvailableField`. Usado na etapa de mapeamento para sugerir e validar correspondências entre colunas da planilha e campos do sistema.                                                             |
| `onDataProcessed`  | Callback executado após o processamento completo dos dados.             | Função chamada com os dados processados: `data` (dados da planilha), `mappings` (mapeamentos realizados), `validation` (resultado da validação) e `transformedData` (dados prontos para importação, se aplicável). |
| `uploadOptions`    | Configurações do upload de arquivos.                                    | Objeto parcial de `UploadOptions`. Permite definir formatos aceitos, tamanho máximo, múltiplos arquivos, etc.                                                                                                      |
| `theme`            | Personalização de cores, espaçamento e sombras do componente.           | Objeto parcial de `ThemeConfig`. Permite customizar visual do componente para se adequar ao tema da aplicação.                                                                                                     |
| `i18n`             | Configuração de idioma e traduções.                                     | Objeto parcial de `I18nConfig`. Define o idioma (`locale`) e permite customizar textos exibidos.                                                                                                                   |
| `showSteps`        | Exibe ou oculta o fluxo de etapas do componente.                        | Booleano. Se `true` (padrão), mostra a navegação por etapas (upload, preview, mapeamento, etc). Se `false`, oculta a barra de etapas.                                                                              |
| `autoValidate`     | Ativa validação automática após upload e mapeamento.                    | Booleano. Se `true` (padrão), valida os dados automaticamente após cada etapa relevante. Se `false`, exige ação manual para validar.                                                                               |
| `autoMap`          | Ativa mapeamento automático de colunas.                                 | Booleano. Se `true`, tenta mapear colunas da planilha para campos do sistema automaticamente. Se `false` (padrão), exige mapeamento manual.                                                                        |
| `customComponents` | Permite substituir componentes internos por versões customizadas.       | Objeto com componentes React opcionais: `Button`, `Input`, `Select`, `Table`, `Loading`. Útil para integração com design system próprio.                                                                           |
| `customStyles`     | Permite adicionar ou sobrescrever classes CSS nos elementos principais. | Objeto com strings de classes CSS para: `container`, `button`, `input`, `select`, `table`, `cell`, `header`. Facilita customização visual sem alterar o tema global.                                               |
| `className`        | Classe CSS adicional para o container principal do componente.          | String. Permite aplicar estilos externos ou utilitários ao componente principal.                                                                                                                                   |

### Upload Component

Responsável pelo upload de arquivos via drag & drop ou browse.

#### Funcionalidades:

-   ✅ Drag & drop visual com feedback
-   ✅ Validação de formato e tamanho
-   ✅ Loading states
-   ✅ Suporte a múltiplos formatos (CSV, XLSX, ODS)
-   ✅ Tratamento de erros

### Preview Component

Visualização paginada dos dados antes do processamento.

#### Funcionalidades:

-   ✅ Preview limitado (máx. 10 linhas, 10 colunas)
-   ✅ Informações do arquivo (nome, tamanho, data)
-   ✅ Navegação por células
-   ✅ Responsivo com scroll horizontal

### Column Mapping Component

Mapeamento inteligente de colunas para campos do sistema.

#### Funcionalidades:

-   ✅ Mapeamento manual via dropdowns
-   ✅ Auto-mapeamento inteligente (opcional)
-   ✅ Validação de campos obrigatórios
-   ✅ Candidatos de coluna sugeridos
-   ✅ Feedback visual de progresso

### Validation Component

Validação automática dos dados mapeados.

#### Funcionalidades:

-   ✅ Regras de validação customizáveis
-   ✅ Detecção de erros e avisos
-   ✅ Agrupamento por tipo de problema
-   ✅ Navegação para células problemáticas
-   ✅ Estatísticas de validação

### Data Editor Component

Edição inline de dados com validação em tempo real.

#### Funcionalidades:

-   ✅ Edição inline de células
-   ✅ Validação em tempo real
-   ✅ Filtros (todos/erros apenas)
-   ✅ Navegação por teclado
-   ✅ Undo/redo básico

### Result Component

Feedback final com estatísticas e opções.

#### Funcionalidades:

-   ✅ Estatísticas completas (total, válidos, erros, avisos)
-   ✅ Download de dados processados
-   ✅ Navegação de volta aos steps anteriores

## Tema e customização

Sistema completo de temas com customização total de cores, componentes e estilos.

### ThemeConfig completo:

```tsx
interface ThemeConfig {
	colors: {
		primary: string; // Azul principal para ações
		secondary: string; // Cinza para elementos secundários
		success: string; // Verde para sucesso/validação
		warning: string; // Amarelo para avisos
		error: string; // Vermelho para erros
		background: string; // Fundo geral da aplicação
		surface: string; // Fundo de cards/componentes
		text: string; // Texto principal
		textSecondary: string; // Texto secundário
	};
	spacing: {
		xs: string; // 0.25rem
		sm: string; // 0.5rem
		md: string; // 1rem
		lg: string; // 1.5rem
		xl: string; // 2rem
	};
	borderRadius: string; // 0.375rem
	shadows: {
		sm: string; // Sombra pequena
		md: string; // Sombra média
		lg: string; // Sombra grande
	};
}
```

### Exemplo de tema dark:

```tsx
const darkTheme: Partial<ThemeConfig> = {
	colors: {
		primary: "#60A5FA",
		secondary: "#6B7280",
		success: "#34D399",
		warning: "#FBBF24",
		error: "#F87171",
		background: "#0F172A",
		surface: "#1E293B",
		text: "#F8FAFC",
		textSecondary: "#CBD5E1",
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
};
```

### Componentes customizáveis:

```tsx
const customComponents = {
	Button: ({ children, ...props }) => (
		<button className="custom-button" {...props}>
			{children}
		</button>
	),
	Input: ({ ...props }) => <input className="custom-input" {...props} />,
	Select: ({ children, ...props }) => (
		<select className="custom-select" {...props}>
			{children}
		</select>
	),
	Table: ({ children, ...props }) => (
		<table className="custom-table" {...props}>
			{children}
		</table>
	),
	Loading: ({ ...props }) => (
		<div className="custom-loading" {...props}>
			<div className="spinner" />
		</div>
	),
};
```

### Custom Styles:

```tsx
const customStyles = {
	container: "my-custom-container",
	button: "my-button-styles",
	input: "my-input-styles",
	select: "my-select-styles",
	table: "my-table-styles",
	cell: "my-cell-styles",
	header: "my-header-styles",
};
```

## Validação de dados

Sistema robusto de validação com regras customizáveis.

### Tipos de regras:

```tsx
interface ValidationRule {
	type:
		| "required"
		| "minLength"
		| "maxLength"
		| "pattern"
		| "min"
		| "max"
		| "custom";
	value?: string | number | RegExp;
	message: string;
	validator?: (value: unknown) => boolean;
}
```

### Exemplo de uso:

```tsx
const availableFields = [
	{
		field: "email",
		label: "Email",
		dataType: "email" as const,
		required: true,
		validation: [
			{
				type: "pattern",
				value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				message: "Email inválido",
			},
		],
	},
	{
		field: "age",
		label: "Idade",
		dataType: "number" as const,
		validation: [
			{
				type: "min",
				value: 0,
				message: "Idade deve ser positiva",
			},
			{
				type: "max",
				value: 120,
				message: "Idade deve ser realista",
			},
		],
	},
];
```

### ValidationResult:

```tsx
interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

interface ValidationError {
	row: number;
	column: number;
	field: string;
	message: string;
	value: unknown;
}
```

## Exportação de dados

### Exemplo de uso:

```tsx
// No callback onDataProcessed, você pode implementar exportação
const handleDataProcessed = (data, mappings, validation, transformedData) => {
	if (validation.isValid && transformedData) {
		// Exportar como CSV
		const csvContent = transformedData
			.map((row) => Object.values(row).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "dados-processados.csv";
		a.click();

		URL.revokeObjectURL(url);
	}
};
```

## Internacionalização (i18n)

Suporte completo a múltiplos idiomas.

### I18nConfig:

```tsx
interface I18nConfig {
	locale: string;
	messages: Record<string, string>;
}
```

### Idiomas suportados:

-   `pt-BR` (Português Brasil) - padrão
-   `en-US` (Inglês EUA)
-   `es-ES` (Espanhol da Espanha)

### Exemplo de uso:

```tsx
const i18nConfig = {
	locale: "pt-BR",
	messages: {
		// Sobrescrever mensagens específicas
		"upload.dragAndDrop": "Arraste seu arquivo aqui",
		"validation.errors": "Erros encontrados",
	},
};
```

### Chaves de tradução disponíveis:

-   `upload.*`: Mensagens do componente de upload
-   `preview.*`: Mensagens do componente de preview
-   `mapping.*`: Mensagens do mapeamento de colunas
-   `validation.*`: Mensagens de validação
-   `editor.*`: Mensagens do editor de dados
-   `result.*`: Mensagens do resultado final
-   `common.*`: Mensagens comuns

## Hooks personalizados

### useSpreadsheetData

Hook principal para gerenciamento de estado.

```tsx
import { useSpreadsheetData } from "react-spreadsheet-upload";

const {
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
} = useSpreadsheetData();
```

### useFileParser

Hook para parsing de arquivos.

```tsx
import { useFileParser } from "react-spreadsheet-upload";

const { parseFile } = useFileParser();

// Uso
const handleFile = async (file: File) => {
	const result = await parseFile(file);
	console.log("Dados parseados:", result);
};
```

### useValidation

Hook para validação de dados.

```tsx
import { useValidation } from "react-spreadsheet-upload";

const { validateData } = useValidation(i18n);

// Uso
const validationResult = await validateData(data, mappings);
```

## Exemplos avançados

### Com tema customizado completo:

```tsx
import { SpreadsheetUpload } from "react-spreadsheet-upload";

const customTheme = {
	colors: {
		primary: "#6366f1", // Indigo
		secondary: "#64748b", // Slate
		success: "#059669", // Emerald
		warning: "#d97706", // Amber
		error: "#dc2626", // Red
		background: "#0f172a", // Slate-900
		surface: "#1e293b", // Slate-800
		text: "#f1f5f9", // Slate-100
		textSecondary: "#94a3b8", // Slate-400
	},
	spacing: {
		xs: "0.125rem",
		sm: "0.25rem",
		md: "0.5rem",
		lg: "1rem",
		xl: "1.5rem",
	},
	borderRadius: "0.5rem",
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
	},
};

// Componentes customizados
const CustomButton = ({ children, className, ...props }) => (
	<button
		className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${className}`}
		{...props}
	>
		{children}
	</button>
);

function AdvancedExample() {
	return (
		<SpreadsheetUpload
			availableFields={[
				{
					field: "name",
					label: "Nome",
					dataType: "string",
					required: true,
				},
				{
					field: "email",
					label: "Email",
					dataType: "email",
					required: true,
				},
				{ field: "phone", label: "Telefone", dataType: "string" },
				{
					field: "birthDate",
					label: "Data Nascimento",
					dataType: "date",
				},
			]}
			theme={customTheme}
			customComponents={{
				Button: CustomButton,
			}}
			uploadOptions={{
				acceptedFormats: [".csv", ".xlsx"],
				maxFileSize: 5 * 1024 * 1024, // 5MB
				multiple: false,
				autoParse: true,
			}}
			i18n={{
				locale: "pt-BR",
			}}
			onDataProcessed={(data, mappings, validation, transformed) => {
				console.log("Processamento completo:", {
					data,
					mappings,
					validation,
					transformed,
				});
			}}
		/>
	);
}
```

### Com validação avançada:

```tsx
const availableFields = [
	{
		field: "name",
		label: "Nome Completo",
		dataType: "string",
		required: true,
		validation: [
			{
				type: "minLength",
				value: 2,
				message: "Nome deve ter pelo menos 2 caracteres",
			},
			{
				type: "maxLength",
				value: 100,
				message: "Nome deve ter no máximo 100 caracteres",
			},
		],
	},
	{
		field: "email",
		label: "Email",
		dataType: "email",
		required: true,
		validation: [
			{
				type: "pattern",
				value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				message: "Email deve ter formato válido",
			},
		],
	},
	{
		field: "age",
		label: "Idade",
		dataType: "number",
		validation: [
			{
				type: "min",
				value: 0,
				message: "Idade deve ser positiva",
			},
			{
				type: "max",
				value: 120,
				message: "Idade deve ser realista",
			},
			{
				type: "custom",
				message: "Idade deve ser maior que 18 para cadastro",
				validator: (value) => Number(value) >= 18,
			},
		],
	},
];
```

### Com auto-mapeamento inteligente:

```tsx
const availableFields = [
	{
		field: "nome_completo",
		label: "Nome Completo",
		dataType: "string",
		required: true,
		columnCandidates: ["nome", "name", "fullname", "full_name"],
	},
	{
		field: "email_principal",
		label: "Email Principal",
		dataType: "email",
		required: true,
		columnCandidates: ["email", "e-mail", "mail", "email_principal"],
	},
];

function SmartMappingExample() {
	return (
		<SpreadsheetUpload
			availableFields={availableFields}
			autoMap={true} // Habilita mapeamento automático
			onDataProcessed={(data, mappings, validation, transformed) => {
				// Mapeamento será feito automaticamente baseado nos columnCandidates
				console.log("Mapeamento automático aplicado:", mappings);
			}}
		/>
	);
}
```

## API de referência

### Constantes e utilitários

```tsx
// Configurações padrão
export const defaultTheme: ThemeConfig;
export const defaultUploadOptions: UploadOptions;
export const defaultI18nConfig: I18nConfig;

// Utilitários
export const supportedFormats = [".csv", ".xlsx", ".ods"];
export const maxFileSizeDefault = 10 * 1024 * 1024; // 10MB
```

## Contribuição

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito por [João Pedro (gepetojj)](https://github.com/gepetojj)
