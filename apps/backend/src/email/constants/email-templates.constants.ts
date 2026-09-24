/**
 * SendGrid dynamic template IDs (managed in SendGrid Console). Keep names domain-scoped
 * (LOGIN_OTP, SIGNUP_OTP, WELCOME, PASSWORD_RESET, …) so callers stay provider-agnostic.
 * Add new templates here rather than hard-coding IDs at call sites.
 */
export const EMAIL_TEMPLATES = {
  /** Email OTP for signup / email-verification flow. */
  SIGNUP_OTP: 'd-ab4e880fe39140b7b342677de68cdfb4',
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
