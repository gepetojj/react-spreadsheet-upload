# react-spreadsheet-upload

Complete React library for spreadsheet data upload, preview, column mapping, validation, and editing (CSV, XLSX). Focused on smooth user experience, full customization (themes, components, styles) and native responsiveness.

![GIF demonstrando uso da biblioteca](https://github.com/gepetojj/react-spreadsheet-upload/raw/main/.github/blobs/demo.gif)

## Table of Contents

-   Quick Concepts
-   Installation
-   Minimal Example (end-to-end)
-   Main Types
-   Components and Features
-   Theme and Customization
-   Data Validation
-   Data Export
-   Internationalization (i18n)
-   Custom Hooks
-   Advanced Examples
-   API Reference
-   Contribution and License

## Quick Concepts

-   **Upload**: Drag & drop or browse with support for CSV, XLSX, ODS
-   **Preview**: Paginated preview with data preview before processing
-   **Column Mapping**: Intelligent column mapping to system fields
-   **Validation**: Automatic validation with customizable rules
-   **Data Editor**: Inline cell editing with real-time validation
-   **Result**: Final feedback with statistics and export options
-   **Theme**: Complete theme system with customizable colors, spacing, and components
-   **Responsive**: Native responsive design for mobile, tablet, and desktop

Principles: minimal external dependencies (only papaparse, xlsx), strong typing, "fail fast" validation, controlled extensibility, mobile-first experience.

## Installation

```sh
npm install react-spreadsheet-upload
# or
yarn add react-spreadsheet-upload
# or
pnpm add react-spreadsheet-upload
```

**Required CSS:**

```js
import "react-spreadsheet-upload/styles.css";
```

## Minimal Example (end-to-end)

Complete flow: upload → preview → mapping → validation → editing → result.

```tsx
import React from "react";
import { SpreadsheetUpload } from "react-spreadsheet-upload";
import "react-spreadsheet-upload/styles.css";

function App() {
	// Available fields in your system
	const availableFields = [
		{
			field: "name",
			label: "Name",
			dataType: "string" as const,
			required: true,
		},
		{
			field: "email",
			label: "Email",
			dataType: "email" as const,
			required: true,
		},
		{ field: "age", label: "Age", dataType: "number" as const },
		{ field: "active", label: "Active", dataType: "boolean" as const },
	];

	const handleDataProcessed = (
		data,
		mappings,
		validation,
		transformedData
	) => {
		console.log("Processed data:", {
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
				locale: "en-US",
			}}
		/>
	);
}

export default App;
```

## Main Types

-   **CellData**: Represents an individual cell with value, type, and validation state
-   **ColumnMapping**: Mapping between spreadsheet column and system field
-   **SpreadsheetData**: Complete processed spreadsheet data
-   **ValidationResult**: Validation result with errors and warnings
-   **ThemeConfig**: Complete configuration of colors, spacing, and shadows
-   **UploadOptions**: Upload configurations (formats, max size, etc.)
-   **AvailableField**: Available fields for system mapping

All types are exported and typed in `src/types/index.ts`.

## Components and Features

### SpreadsheetUpload (main component)

Orchestrator component that manages the entire upload and processing flow.

#### Main Props:

| Prop               | Purpose                                                    | Functionality                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availableFields`  | Defines the system fields available for mapping.           | Array of `AvailableField` objects. Used in the mapping step to suggest and validate matches between spreadsheet columns and system fields.                                                      |
| `onDataProcessed`  | Callback executed after complete data processing.          | Function called with processed data: `data` (spreadsheet data), `mappings` (performed mappings), `validation` (validation result) and `transformedData` (data ready for import, if applicable). |
| `uploadOptions`    | File upload configurations.                                | Partial `UploadOptions` object. Allows defining accepted formats, maximum size, multiple files, etc.                                                                                            |
| `theme`            | Component colors, spacing and shadows customization.       | Partial `ThemeConfig` object. Allows customizing component visuals to match the application's theme.                                                                                            |
| `i18n`             | Language and translations configuration.                   | Partial `I18nConfig` object. Defines the language (`locale`) and allows customizing displayed texts.                                                                                            |
| `showSteps`        | Shows or hides the component's step flow.                  | Boolean. If `true` (default), shows step navigation (upload, preview, mapping, etc). If `false`, hides the step bar.                                                                            |
| `autoValidate`     | Enables automatic validation after upload and mapping.     | Boolean. If `true` (default), validates data automatically after each relevant step. If `false`, requires manual action to validate.                                                            |
| `autoMap`          | Enables automatic column mapping.                          | Boolean. If `true`, attempts to map spreadsheet columns to system fields automatically. If `false` (default), requires manual mapping.                                                          |
| `customComponents` | Allows replacing internal components with custom versions. | Object with optional React components: `Button`, `Input`, `Select`, `Table`, `Loading`. Useful for integration with your own design system.                                                     |
| `customStyles`     | Allows adding or overriding CSS classes on main elements.  | Object with CSS class strings for: `container`, `button`, `input`, `select`, `table`, `cell`, `header`. Facilitates visual customization without changing the global theme.                     |
| `className`        | Additional CSS class for the main component container.     | String. Allows applying external styles or utilities to the main component.                                                                                                                     |

## Theme and Customization

Complete theme system with full customization of colors, components, and styles.

### Complete ThemeConfig:

```tsx
interface ThemeConfig {
	colors: {
		primary: string; // Main blue for actions
		secondary: string; // Gray for secondary elements
		success: string; // Green for success/validation
		warning: string; // Yellow for warnings
		error: string; // Red for errors
		background: string; // General application background
		surface: string; // Cards/components background
		text: string; // Main text
		textSecondary: string; // Secondary text
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
		sm: string; // Small shadow
		md: string; // Medium shadow
		lg: string; // Large shadow
	};
}
```

### Dark theme example:

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

### Customizable Components:

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

## Data Validation

Robust validation system with customizable rules.

### Rule Types:

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

### Usage Example:

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
				message: "Invalid email",
			},
		],
	},
	{
		field: "age",
		label: "Age",
		dataType: "number" as const,
		validation: [
			{
				type: "min",
				value: 0,
				message: "Age must be positive",
			},
			{
				type: "max",
				value: 120,
				message: "Age must be realistic",
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

## Data Export

### Usage Example:

```tsx
// In the onDataProcessed callback, you can implement export
const handleDataProcessed = (data, mappings, validation, transformedData) => {
	if (validation.isValid && transformedData) {
		// Export as CSV
		const csvContent = transformedData
			.map((row) => Object.values(row).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "processed-data.csv";
		a.click();

		URL.revokeObjectURL(url);
	}
};
```

## Internationalization (i18n)

Complete support for multiple languages.

### I18nConfig:

```tsx
interface I18nConfig {
	locale: string;
	messages: Record<string, string>;
}
```

### Supported Languages:

-   `pt-BR` (Brazilian Portuguese) - default
-   `en-US` (US English)
-   `es-ES` (Spanish Spain)

### Usage Example:

```tsx
const i18nConfig = {
	locale: "en-US",
	messages: {
		// Override specific messages
		"upload.dragAndDrop": "Drop your file here",
		"validation.errors": "Errors found",
	},
};
```

### Available Translation Keys:

-   `upload.*`: Upload component messages
-   `preview.*`: Preview component messages
-   `mapping.*`: Column mapping messages
-   `validation.*`: Validation messages
-   `editor.*`: Data editor messages
-   `result.*`: Final result messages
-   `common.*`: Common messages

## Custom Hooks

### useSpreadsheetData

Main hook for state management.

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

Hook for file parsing.

```tsx
import { useFileParser } from "react-spreadsheet-upload";

const { parseFile } = useFileParser();

// Usage
const handleFile = async (file: File) => {
	const result = await parseFile(file);
	console.log("Parsed data:", result);
};
```

### useValidation

Hook for data validation.

```tsx
import { useValidation } from "react-spreadsheet-upload";

const { validateData } = useValidation(i18n);

// Usage
const validationResult = await validateData(data, mappings);
```

## Advanced Examples

### With complete custom theme:

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

// Custom components
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
					label: "Name",
					dataType: "string",
					required: true,
				},
				{
					field: "email",
					label: "Email",
					dataType: "email",
					required: true,
				},
				{ field: "phone", label: "Phone", dataType: "string" },
				{
					field: "birthDate",
					label: "Birth Date",
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
				locale: "en-US",
			}}
			onDataProcessed={(data, mappings, validation, transformed) => {
				console.log("Complete processing:", {
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

### With advanced validation:

```tsx
const availableFields = [
	{
		field: "name",
		label: "Full Name",
		dataType: "string",
		required: true,
		validation: [
			{
				type: "minLength",
				value: 2,
				message: "Name must have at least 2 characters",
			},
			{
				type: "maxLength",
				value: 100,
				message: "Name must have at most 100 characters",
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
				message: "Email must have valid format",
			},
		],
	},
	{
		field: "age",
		label: "Age",
		dataType: "number",
		validation: [
			{
				type: "min",
				value: 0,
				message: "Age must be positive",
			},
			{
				type: "max",
				value: 120,
				message: "Age must be realistic",
			},
			{
				type: "custom",
				message: "Age must be greater than 18 for registration",
				validator: (value) => Number(value) >= 18,
			},
		],
	},
];
```

### With smart auto-mapping:

```tsx
const availableFields = [
	{
		field: "full_name",
		label: "Full Name",
		dataType: "string",
		required: true,
		columnCandidates: ["nome", "name", "fullname", "full_name"],
	},
	{
		field: "primary_email",
		label: "Primary Email",
		dataType: "email",
		required: true,
		columnCandidates: ["email", "e-mail", "mail", "email_principal"],
	},
];

function SmartMappingExample() {
	return (
		<SpreadsheetUpload
			availableFields={availableFields}
			autoMap={true} // Enables automatic mapping
			onDataProcessed={(data, mappings, validation, transformed) => {
				// Mapping will be done automatically based on columnCandidates
				console.log("Automatic mapping applied:", mappings);
			}}
		/>
	);
}
```

## API Reference

### Constants and utilities

```tsx
// Default configurations
export const defaultTheme: ThemeConfig;
export const defaultUploadOptions: UploadOptions;
export const defaultI18nConfig: I18nConfig;

// Utilities
export const supportedFormats = [".csv", ".xlsx", ".ods"];
export const maxFileSizeDefault = 10 * 1024 * 1024; // 10MB
```

## Contribution

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT - see the [LICENSE](LICENSE) file for more details.

---

Made by [João Pedro (gepetojj)](https://github.com/gepetojj)
