import { useMemo } from "react";

import { type Locale, type MessageKey, messages } from "./messages";

export interface UseI18nReturn {
	t: (key: MessageKey, params?: Record<string, unknown>) => string;
	locale: Locale;
	setLocale: (locale: Locale) => void;
}

export function useI18n(locale: Locale = "pt-BR"): UseI18nReturn {
	const t = useMemo(() => {
		return (key: MessageKey, params?: Record<string, unknown>): string => {
			let message =
				messages[locale][key] || messages["pt-BR"][key] || key;

			if (params) {
				Object.entries(params).forEach(([param, value]) => {
					message = message.replace(`{${param}}`, String(value));
				});
			}

			return message;
		};
	}, [locale]);

	const setLocale = (_newLocale: Locale) => {
		// This would typically be handled by a context provider
		// For now, we'll just return the function signature
	};

	return {
		t,
		locale,
		setLocale,
	};
}
