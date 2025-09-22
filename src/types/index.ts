export interface CellData {
	value: string | number | boolean | null;
	formatted?: string;
	type?: "string" | "number" | "boolean" | "date" | "formula";
	isValid?: boolean;
	error?: string;
}

export interface ColumnMapping {
	sourceIndex: number;
	sourceName: string;
	targetField: string;
	targetLabel: string;
	required: boolean;
	dataType: "string" | "number" | "boolean" | "date" | "email" | "url";
	validation?: ValidationRule[];
}

export interface ValidationRule {
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

export interface SpreadsheetData {
	headers: string[];
	rows: CellData[][];
	totalRows: number;
	totalColumns: number;
	fileName: string;
	fileSize: number;
	lastModified: Date;
	parsed?: Record<string, unknown>[];
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	row: number;
	column: number;
	field: string;
	message: string;
	value: unknown;
}

export interface ValidationWarning {
	row: number;
	column: number;
	field: string;
	message: string;
	value: unknown;
}

export interface ExportOptions {
	format: "csv" | "xlsx";
	fileName?: string;
	includeHeaders?: boolean;
	delimiter?: string;
}

export interface UploadOptions {
	acceptedFormats: string[];
	maxFileSize: number;
	multiple: boolean;
	autoParse: boolean;
}

export interface ThemeConfig {
	colors: {
		primary: string;
		secondary: string;
		success: string;
		warning: string;
		error: string;
		background: string;
		surface: string;
		text: string;
		textSecondary: string;
	};
	spacing: {
		xs: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
	};
	borderRadius: string;
	shadows: {
		sm: string;
		md: string;
		lg: string;
	};
}

export interface I18nConfig {
	locale: string;
	messages: Record<string, string>;
}

export interface SpreadsheetUploadContextValue {
	data: SpreadsheetData | null;
	columnMappings: ColumnMapping[];
	validationResult: ValidationResult | null;
	theme: ThemeConfig;
	i18n: I18nConfig;
	isLoading: boolean;
	error: string | null;
	actions: {
		setData: (data: SpreadsheetData) => void;
		setColumnMappings: (mappings: ColumnMapping[]) => void;
		setValidationResult: (result: ValidationResult) => void;
		setLoading: (loading: boolean) => void;
		setError: (error: string | null) => void;
		clearData: () => void;
	};
}

export interface ComponentProps {
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}

export interface AvailableField {
	field: string;
	label: string;
	dataType: ColumnMapping["dataType"];
	required?: boolean;
	columnCandidates?: string[];
}

export interface CustomizableComponentProps extends ComponentProps {
	customComponents?: {
		Button?: React.ComponentType<
			React.ButtonHTMLAttributes<HTMLButtonElement>
		>;
		Input?: React.ComponentType<
			React.InputHTMLAttributes<HTMLInputElement>
		>;
		Select?: React.ComponentType<
			React.SelectHTMLAttributes<HTMLSelectElement>
		>;
		Table?: React.ComponentType<
			React.TableHTMLAttributes<HTMLTableElement>
		>;
		Modal?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
		Loading?: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
	};
	customStyles?: {
		container?: string;
		button?: string;
		input?: string;
		select?: string;
		table?: string;
		cell?: string;
		header?: string;
	};
}
