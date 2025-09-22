# React Spreadsheet Upload

Uma biblioteca React moderna e completa para upload, visualização, edição, validação e exportação de arquivos de planilha (CSV/XLSX).

## 🚀 Características

-   **Upload Intuitivo**: Drag & drop com validação de arquivos
-   **Visualização Rica**: Preview dos dados com informações do arquivo
-   **Mapeamento Flexível**: Mapeamento manual e automático de colunas
-   **Validação Robusta**: Validação de dados com feedback visual
-   **Editor In-Place**: Edição de células diretamente na tabela
-   **Exportação Múltipla**: Exportação para CSV e XLSX
-   **Internacionalização**: Suporte completo a i18n (PT-BR/EN-US)
-   **Customização Total**: Temas, componentes customizados e estilos
-   **Performance**: Otimizado para planilhas grandes
-   **TypeScript**: Tipagem completa e segura

## 📦 Instalação

```bash
npm install react-spreadsheet-upload
# ou
yarn add react-spreadsheet-upload
# ou
pnpm add react-spreadsheet-upload
```

## 🎯 Uso Básico

```tsx
import { SpreadsheetUpload } from "react-spreadsheet-upload";
import "react-spreadsheet-upload/styles.css";

function App() {
	const handleDataProcessed = (data, mappings, validation) => {
		console.log("Dados processados:", { data, mappings, validation });
	};

	const handleExport = (data, mappings) => {
		console.log("Exportando:", { data, mappings });
	};

	return (
		<SpreadsheetUpload
			onDataProcessed={handleDataProcessed}
			onExport={handleExport}
			availableFields={[
				{ field: "name", label: "Nome", dataType: "string" },
				{ field: "email", label: "Email", dataType: "email" },
				{ field: "age", label: "Idade", dataType: "number" },
			]}
			autoMap={true}
			autoValidate={true}
		/>
	);
}
```

## 🧩 Componentes Individuais

### Upload

```tsx
import { Upload } from "react-spreadsheet-upload";

<Upload
	onFileSelect={(file) => console.log(file)}
	options={{
		acceptedFormats: [".csv", ".xlsx"],
		maxFileSize: 10, // MB
		multiple: false,
	}}
	loading={false}
	error={null}
/>;
```

### Preview

```tsx
import { Preview } from "react-spreadsheet-upload";

<Preview
	data={spreadsheetData}
	maxRows={10}
	maxColumns={10}
	showFileInfo={true}
	onCellClick={(row, column, value) => {
		console.log("Célula clicada:", { row, column, value });
	}}
/>;
```

### ColumnMapping

```tsx
import { ColumnMapping } from "react-spreadsheet-upload";

<ColumnMapping
	data={spreadsheetData}
	mappings={columnMappings}
	onMappingsChange={setColumnMappings}
	availableFields={availableFields}
	autoMapEnabled={true}
/>;
```

### Validation

```tsx
import { Validation } from "react-spreadsheet-upload";

<Validation
	validationResult={validationResult}
	onErrorClick={(error) => console.log("Erro:", error)}
	onWarningClick={(warning) => console.log("Aviso:", warning)}
	showDetails={true}
/>;
```

### DataEditor

```tsx
import { DataEditor } from "react-spreadsheet-upload";

<DataEditor
	data={spreadsheetData}
	onDataChange={setSpreadsheetData}
	onCellEdit={(row, column, value) => {
		console.log("Célula editada:", { row, column, value });
	}}
	editable={true}
	maxRows={50}
	maxColumns={20}
/>;
```

### Export

```tsx
import { Export } from "react-spreadsheet-upload";

<Export
	data={spreadsheetData}
	mappings={columnMappings}
	onExport={(options) => console.log("Exportando:", options)}
	defaultFileName="meus_dados"
	defaultFormat="csv"
/>;
```

## 🎨 Customização

### Temas

```tsx
<SpreadsheetUpload
	theme={{
		colors: {
			primary: "#8B5CF6",
			secondary: "#06B6D4",
			success: "#10B981",
			warning: "#F59E0B",
			error: "#EF4444",
		},
		spacing: {
			xs: "0.25rem",
			sm: "0.5rem",
			md: "1rem",
			lg: "1.5rem",
			xl: "2rem",
		},
		borderRadius: "0.5rem",
	}}
/>
```

### Componentes Customizados

```tsx
<SpreadsheetUpload
	customComponents={{
		Button: MyCustomButton,
		Input: MyCustomInput,
		Table: MyCustomTable,
	}}
	customStyles={{
		container: "my-custom-container",
		button: "my-custom-button",
		table: "my-custom-table",
	}}
/>
```

### Internacionalização

```tsx
<SpreadsheetUpload
	i18n={{
		locale: "en-US",
		messages: {
			"upload.title": "My Custom Upload Title",
			"upload.dragAndDrop": "Drop your file here",
		},
	}}
/>
```

## 🔧 Hooks

### useSpreadsheetData

```tsx
import { useSpreadsheetData } from "react-spreadsheet-upload";

const {
	data,
	validationResult,
	columnMappings,
	isLoading,
	error,
	setData,
	setValidationResult,
	setColumnMappings,
	updateCell,
	clearData,
} = useSpreadsheetData();
```

### useFileParser

```tsx
import { useFileParser } from "react-spreadsheet-upload";

const { parseFile, parseCSV, parseXLSX } = useFileParser();

const handleFile = async (file) => {
	const data = await parseFile(file);
	console.log("Dados parseados:", data);
};
```

### useValidation

```tsx
import { useValidation } from "react-spreadsheet-upload";

const { validateData, validateCell } = useValidation();

const validation = validateData(data, mappings);
console.log("Validação:", validation);
```

### useExport

```tsx
import { useExport } from "react-spreadsheet-upload";

const { exportData, exportToCSV, exportToXLSX } = useExport();

const handleExport = () => {
	exportToCSV(data, mappings, {
		fileName: "meus_dados.csv",
		includeHeaders: true,
	});
};
```

## 📋 Tipos TypeScript

```tsx
import type {
	SpreadsheetData,
	ColumnMapping,
	ValidationResult,
	ExportOptions,
	UploadOptions,
	ThemeConfig,
	I18nConfig,
} from "react-spreadsheet-upload";
```

### SpreadsheetData

```tsx
interface SpreadsheetData {
	headers: string[];
	rows: CellData[][];
	totalRows: number;
	totalColumns: number;
	fileName: string;
	fileSize: number;
	lastModified: Date;
}
```

### ColumnMapping

```tsx
interface ColumnMapping {
	sourceIndex: number;
	sourceName: string;
	targetField: string;
	targetLabel: string;
	required: boolean;
	dataType: "string" | "number" | "boolean" | "date" | "email" | "url";
	validation?: ValidationRule[];
}
```

## 🎭 Storybook

A biblioteca inclui stories completas do Storybook para demonstração e teste:

```bash
npm run storybook
```

Stories disponíveis:

-   **Default**: Uso básico com todas as funcionalidades
-   **WithoutSteps**: Sem navegação por etapas
-   **WithAutoMap**: Com mapeamento automático
-   **CustomTheme**: Com tema customizado
-   **EnglishLocale**: Em inglês
-   **LargeFileUpload**: Para arquivos grandes
-   **CSVOnly**: Apenas CSV
-   **ExcelOnly**: Apenas Excel

## 🚀 Performance

-   **Virtualização**: Tabelas grandes são renderizadas eficientemente
-   **Memoização**: Componentes otimizados com React.memo
-   **Lazy Loading**: Parsing assíncrono de arquivos
-   **Debouncing**: Validação otimizada com debounce
-   **Tree Shaking**: Importação modular para bundle menor

## 🌍 Internacionalização

Suporte nativo para:

-   **Português (pt-BR)**: Idioma padrão
-   **Inglês (en-US)**: Suporte completo

Adicione novos idiomas:

```tsx
import { messages } from "react-spreadsheet-upload";

const customMessages = {
	...messages,
	"es-ES": {
		"upload.title": "Subida de Hoja de Cálculo",
		"upload.dragAndDrop": "Arrastra y suelta tu archivo aquí",
		// ... mais traduções
	},
};
```

## 📱 Responsividade

Todos os componentes são totalmente responsivos e funcionam em:

-   Desktop
-   Tablet
-   Mobile

## 🔒 Validação

### Tipos de Validação Suportados

-   **Required**: Campo obrigatório
-   **MinLength/MaxLength**: Tamanho mínimo/máximo
-   **Pattern**: Expressão regular
-   **Min/Max**: Valores numéricos
-   **Email**: Validação de email
-   **URL**: Validação de URL
-   **Custom**: Validador personalizado

### Exemplo de Validação

```tsx
const validationRules: ValidationRule[] = [
	{
		type: "required",
		message: "Este campo é obrigatório",
	},
	{
		type: "minLength",
		value: 3,
		message: "Mínimo 3 caracteres",
	},
	{
		type: "pattern",
		value: /^[a-zA-Z]+$/,
		message: "Apenas letras",
	},
	{
		type: "custom",
		validator: (value) => value !== "admin",
		message: "Nome de usuário inválido",
	},
];
```

## 🎯 Casos de Uso

### Importação de Usuários

```tsx
<SpreadsheetUpload
	availableFields={[
		{ field: "name", label: "Nome Completo", dataType: "string" },
		{ field: "email", label: "E-mail", dataType: "email" },
		{ field: "role", label: "Função", dataType: "string" },
		{ field: "active", label: "Ativo", dataType: "boolean" },
	]}
	autoMap={true}
	onDataProcessed={(data, mappings, validation) => {
		if (validation.isValid) {
			// Importar usuários
			importUsers(data, mappings);
		}
	}}
/>
```

### Importação de Produtos

```tsx
<SpreadsheetUpload
	availableFields={[
		{ field: "sku", label: "SKU", dataType: "string" },
		{ field: "name", label: "Nome do Produto", dataType: "string" },
		{ field: "price", label: "Preço", dataType: "number" },
		{ field: "category", label: "Categoria", dataType: "string" },
		{ field: "inStock", label: "Em Estoque", dataType: "boolean" },
	]}
	uploadOptions={{
		acceptedFormats: [".csv"],
		maxFileSize: 5,
	}}
/>
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

-   📧 Email: contato.gepetojj@gmail.com
-   🐛 Issues: [GitHub Issues](https://github.com/gepetojj/react-spreadsheet-upload/issues)
-   📖 Documentação: [Storybook](https://gepetojj.github.io/react-spreadsheet-upload)

## 🙏 Agradecimentos

-   [Papa Parse](https://www.papaparse.com/) - Parser CSV
-   [SheetJS](https://sheetjs.com/) - Parser XLSX
-   [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
-   [React](https://reactjs.org/) - Biblioteca JavaScript
-   [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript
