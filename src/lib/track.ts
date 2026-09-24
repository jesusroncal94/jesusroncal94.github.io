export type ConversionEvent = 'cv_download' | 'email_copy' | 'email_open' | 'profile_open';

export function track(_event: ConversionEvent, _props?: Record<string, string>): void {}
