"use client";

import clsx from "clsx";
import { useMemo } from "react";

import { useI18n } from "../../i18n";
import type {
	CustomizableComponentProps,
	I18nConfig,
	ValidationResult,
} from "../../types";

export interface ValidationProps extends CustomizableComponentProps {
	validationResult: ValidationResult;
	onErrorClick?: (error: ValidationResult["errors"][0]) => void;
	onWarningClick?: (warning: ValidationResult["warnings"][0]) => void;
	showDetails?: boolean;
	i18n?: Partial<I18nConfig>;
	// biome-ignore lint/suspicious/noExplicitAny: É necessário para o tipo any
	theme?: any;
}

export function Validation({
	validationResult,
	onErrorClick,
	onWarningClick,
	showDetails = true,
	i18n,
	className = "",
	customStyles = {},
	theme,
}: ValidationProps) {
	const { t } = useI18n(i18n?.locale as "pt-BR" | "en-US" | undefined);

	const groupedErrors = useMemo(() => {
		const groups: Record<string, ValidationResult["errors"]> = {};

		validationResult.errors.forEach((error) => {
			const key = `${error.row}-${error.column}`;
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(error);
		});

		return groups;
	}, [validationResult.errors]);

	const groupedWarnings = useMemo(() => {
		const groups: Record<string, ValidationResult["warnings"]> = {};

		validationResult.warnings.forEach((warning) => {
			const key = `${warning.row}-${warning.column}`;
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(warning);
		});

		return groups;
	}, [validationResult.warnings]);

	const handleErrorClick = (error: ValidationResult["errors"][0]) => {
		if (onErrorClick) {
			onErrorClick(error);
		}
	};

	const handleWarningClick = (warning: ValidationResult["warnings"][0]) => {
		if (onWarningClick) {
			onWarningClick(warning);
		}
	};

	return (
		<div
			className={clsx(
				"rsu rsu:w-full rsu:space-y-4",
				className,
				customStyles.container
			)}
			style={
				{
					"--validation-error-color":
						theme?.colors.error || "#EF4444",
					"--validation-warning-color":
						theme?.colors.warning || "#F59E0B",
					"--validation-success-color":
						theme?.colors.success || "#10B981",
					"--validation-text-color": theme?.colors.text || "#1F2937",
					"--validation-text-secondary-color":
						theme?.colors.textSecondary || "#6B7280",
					"--validation-surface-color":
						theme?.colors.surface || "#FFFFFF",
					"--validation-border-radius":
						theme?.borderRadius || "0.375rem",
				} as React.CSSProperties
			}
		>
			<div className="rsu:flex rsu:items-center rsu:space-x-4">
				<h3
					className="rsu:font-semibold rsu:text-lg"
					style={{ color: theme?.colors.text || "#1F2937" }}
				>
					{t("validation.title")}
				</h3>

				<div className="rsu:flex rsu:space-x-4">
					<div
						className={`rsu:flex rsu:items-center rsu:space-x-2 ${
							validationResult.errors.length > 0
								? "rsu:text-red-600"
								: "rsu:text-green-600"
						}`}
					>
						<div
							className={`rsu:h-3 rsu:w-3 rsu:rounded-full ${
								validationResult.errors.length > 0
									? "rsu:bg-red-500"
									: "rsu:bg-green-500"
							}`}
						></div>
						<span className="rsu:font-medium rsu:text-sm">
							{validationResult.errors.length > 0
								? t("validation.errors", {
										count: validationResult.errors.length,
								  })
								: t("validation.noErrors")}
						</span>
					</div>

					{validationResult.warnings.length > 0 && (
						<div className="rsu:flex rsu:items-center rsu:space-x-2 rsu:text-yellow-600">
							<div className="rsu:h-3 rsu:w-3 rsu:rounded-full rsu:bg-yellow-500"></div>
							<span className="rsu:font-medium rsu:text-sm">
								{t("validation.warnings", {
									count: validationResult.warnings.length,
								})}
							</span>
						</div>
					)}
				</div>
			</div>

			{validationResult.errors.length > 0 && (
				<div className="rsu:rounded-lg rsu:border rsu:border-red-200 rsu:bg-red-50">
					<div className="rsu:p-4">
						<h4 className="rsu:mb-3 rsu:font-medium rsu:text-md rsu:text-red-800">
							{t("validation.errors", {
								count: validationResult.errors.length,
							})}
						</h4>

						{showDetails ? (
							<div className="rsu:space-y-2">
								{Object.entries(groupedErrors).map(
									([position, errors]) => {
										const [row, column] = position
											.split("-")
											.map(Number);
										const firstError = errors[0];

										return (
											<button
												type="button"
												key={`position-${position}`}
												className="rsu:cursor-pointer rsu:rounded-md rsu:border rsu:border-red-200 rsu:bg-white rsu:p-3 rsu:hover:bg-red-100"
												onClick={() =>
													handleErrorClick(firstError)
												}
												tabIndex={0}
											>
												<div className="rsu:flex rsu:items-start rsu:space-x-3">
													<div className="rsu:flex-shrink-0">
														<div className="rsu:flex rsu:h-8 rsu:w-8 rsu:items-center rsu:justify-center rsu:rounded-full rsu:bg-red-100">
															<span className="rsu:font-medium rsu:text-red-600 rsu:text-sm">
																{row + 1}
															</span>
														</div>
													</div>
													<div className="rsu:min-w-0 rsu:flex-1">
														<div className="rsu:text-red-800 rsu:text-sm">
															<span className="rsu:font-medium">
																{t(
																	"validation.row",
																	{
																		row:
																			row +
																			1,
																	}
																)}{" "}
																•{" "}
																{t(
																	"validation.column",
																	{
																		column:
																			column +
																			1,
																	}
																)}
															</span>
															{firstError.field && (
																<span className="rsu:ml-2">
																	•{" "}
																	{t(
																		"validation.field",
																		{
																			field: firstError.field,
																		}
																	)}
																</span>
															)}
														</div>
														<div className="rsu:mt-1 rsu:text-red-700 rsu:text-sm">
															{errors.map(
																(
																	error,
																	index
																) => (
																	<div
																		key={`error-${error.row}-${error.column}-${index}`}
																	>
																		{t(
																			"validation.message",
																			{
																				message:
																					error.message,
																			}
																		)}
																		{error.value !==
																			null &&
																			error.value !==
																				undefined && (
																				<span className="rsu:ml-2 rsu:text-red-600">
																					(
																					{t(
																						"validation.value",
																						{
																							value: String(
																								error.value
																							),
																						}
																					)}

																					)
																				</span>
																			)}
																	</div>
																)
															)}
														</div>
													</div>
												</div>
											</button>
										);
									}
								)}
							</div>
						) : (
							<div className="rsu:text-red-700 rsu:text-sm">
								<p>
									{t("validation.errorsFound", {
										count: validationResult.errors.length,
									})}
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{validationResult.warnings.length > 0 && (
				<div className="rsu:rounded-lg rsu:border rsu:border-yellow-200 rsu:bg-yellow-50">
					<div className="rsu:p-4">
						<h4 className="rsu:mb-3 rsu:font-medium rsu:text-md rsu:text-yellow-800">
							{t("validation.warnings", {
								count: validationResult.warnings.length,
							})}
						</h4>

						{showDetails ? (
							<div className="rsu:space-y-2">
								{Object.entries(groupedWarnings).map(
									([position, warnings]) => {
										const [row, column] = position
											.split("-")
											.map(Number);
										const firstWarning = warnings[0];

										return (
											<button
												type="button"
												key={`position-${position}`}
												className="rsu:cursor-pointer rsu:rounded-md rsu:border rsu:border-yellow-200 rsu:bg-white rsu:p-3 rsu:hover:bg-yellow-100"
												onClick={() =>
													handleWarningClick(
														firstWarning
													)
												}
												tabIndex={0}
											>
												<div className="rsu:flex rsu:items-start rsu:space-x-3">
													<div className="rsu:flex-shrink-0">
														<div className="rsu:flex rsu:h-8 rsu:w-8 rsu:items-center rsu:justify-center rsu:rounded-full rsu:bg-yellow-100">
															<span className="rsu:font-medium rsu:text-sm rsu:text-yellow-600">
																{row + 1}
															</span>
														</div>
													</div>
													<div className="rsu:min-w-0 rsu:flex-1">
														<div className="rsu:text-sm rsu:text-yellow-800">
															<span className="rsu:font-medium">
																{t(
																	"validation.row",
																	{
																		row:
																			row +
																			1,
																	}
																)}{" "}
																•{" "}
																{t(
																	"validation.column",
																	{
																		column:
																			column +
																			1,
																	}
																)}
															</span>
															{firstWarning.field && (
																<span className="rsu:ml-2">
																	•{" "}
																	{t(
																		"validation.field",
																		{
																			field: firstWarning.field,
																		}
																	)}
																</span>
															)}
														</div>
														<div className="rsu:mt-1 rsu:text-sm rsu:text-yellow-700">
															{warnings.map(
																(
																	warning,
																	index
																) => (
																	<div
																		key={`warning-${warning.row}-${warning.column}-${index}`}
																	>
																		{t(
																			"validation.message",
																			{
																				message:
																					warning.message,
																			}
																		)}
																		{warning.value !==
																			null &&
																			warning.value !==
																				undefined && (
																				<span className="rsu:ml-2 rsu:text-yellow-600">
																					(
																					{t(
																						"validation.value",
																						{
																							value: String(
																								warning.value
																							),
																						}
																					)}

																					)
																				</span>
																			)}
																	</div>
																)
															)}
														</div>
													</div>
												</div>
											</button>
										);
									}
								)}
							</div>
						) : (
							<div className="rsu:text-sm rsu:text-yellow-700">
								<p>
									{t("validation.warningsFound", {
										count: validationResult.warnings.length,
									})}
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{validationResult.errors.length === 0 &&
				validationResult.warnings.length === 0 && (
					<div className="rsu:py-8 rsu:text-center rsu:text-gray-500">
						<div className="rsu:mx-auto rsu:mb-4 rsu:h-12 rsu:w-12 rsu:text-green-500">
							<svg
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<p className="rsu:font-medium rsu:text-gray-900 rsu:text-lg">
							{t("validation.successMessage")}
						</p>
						<p className="rsu:text-gray-500 rsu:text-sm">
							{t("validation.noIssuesFound")}
						</p>
					</div>
				)}
		</div>
	);
}
