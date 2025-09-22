import { useMemo } from "react";

import { type Locale, type MessageKey, messages } from "./messages";

export interface UseI18nReturn {
	t: (key: MessageKey, params?: Record<string, unknown>) => string;
	locale: Locale;
}

export function useI18n(locale: Locale = "pt-BR"): UseI18nReturn {
	const t = useMemo(() => {
		return (key: MessageKey, params?: Record<string, unknown>): string => {
			let message =
				(messages[locale] as Record<string, string>)?.[key] ||
				(messages["pt-BR"] as Record<string, string>)?.[key] ||
				key;

			if (params) {
				Object.entries(params).forEach(([param, value]) => {
					message = message.replace(`{${param}}`, String(value));
				});
			}

			return message;
		};
	}, [locale]);

	return {
		t,
		locale,
	};
}
