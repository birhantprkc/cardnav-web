/** 自动分类名称的翻译覆盖；未定义的 ID 使用分类目录中的原始名称。 */
import type { Locale } from './config.js';

export const autoCategoryLabels: Record<Locale, Readonly<Record<string, string>>> = {
  zh: {},
  en: {
    'api-gateway': 'API gateway',
    other: 'Other',
    vcc: 'VCC',
    icloud: 'iCloud Mail',
    'phone-verification': 'Phone verification',
  },
  ru: {
    'api-gateway': 'API-шлюз',
    other: 'Другое',
    vcc: 'VCC',
    icloud: 'Почта iCloud',
    'phone-verification': 'SMS-верификация',
  },
};
