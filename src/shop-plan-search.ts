/**
 * 文件说明: 维护卡网商品页快速搜索和可索引预设搜索结果页的计划词真源。
 */
import { autoCategoryLabel } from './shop-auto-category.js';

export type QuickPlanSearchTerm = {
  label: string;
  query: string;
  slug: string;
  legacySlugs?: string[];
  legacyPlanName?: string;
  officialPriceSlug?: string;
  gatewayModelFamily?: string;
  gatewayModelFamilyName?: string;
};

const quickPlanDefinitions: Omit<QuickPlanSearchTerm, 'label' | 'query'>[] = [
  { slug: 'gpt-free', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },
  { slug: 'gpt-go', officialPriceSlug: 'chatgpt-go', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },
  { slug: 'gpt-plus', officialPriceSlug: 'chatgpt-plus', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },
  { slug: 'gpt-pro-100', legacySlugs: ['gpt-pro-5x'], legacyPlanName: 'Pro 5x', officialPriceSlug: 'chatgpt-pro-100', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },
  { slug: 'gpt-pro-200', legacySlugs: ['gpt-pro-20x'], legacyPlanName: 'Pro 20x', officialPriceSlug: 'chatgpt-pro-200', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },
  { slug: 'gpt-pro-500', officialPriceSlug: 'chatgpt-pro-500', gatewayModelFamily: 'gpt', gatewayModelFamilyName: 'GPT' },

  { slug: 'claude' },
  { slug: 'claude-pro', officialPriceSlug: 'claude-pro', gatewayModelFamily: 'claude', gatewayModelFamilyName: 'Claude' },
  { slug: 'claude-max-5x', officialPriceSlug: 'claude-max-5x', gatewayModelFamily: 'claude', gatewayModelFamilyName: 'Claude' },
  { slug: 'claude-max-20x', officialPriceSlug: 'claude-max-20x', gatewayModelFamily: 'claude', gatewayModelFamilyName: 'Claude' },

  { slug: 'gemini-ai-plus' },
  { slug: 'gemini-ai-pro', officialPriceSlug: 'gemini-advanced', gatewayModelFamily: 'gemini', gatewayModelFamilyName: 'Gemini' },
  { slug: 'gemini-ai-ultra', officialPriceSlug: 'gemini-ai-ultra', gatewayModelFamily: 'gemini', gatewayModelFamilyName: 'Gemini' },

  { slug: 'supergrok', officialPriceSlug: 'grok-supergrok', gatewayModelFamily: 'grok', gatewayModelFamilyName: 'Grok' },
  { slug: 'supergrok-heavy', officialPriceSlug: 'grok-supergrok-heavy', gatewayModelFamily: 'grok', gatewayModelFamilyName: 'Grok' },
  { slug: 'x-premium', officialPriceSlug: 'x-premium' },
  { slug: 'x-premium-plus', officialPriceSlug: 'x-premium-plus' },

  { slug: 'api-gateway' },
  { slug: 'phone-verification' },

  { slug: 'cursor' },

  { slug: 'gmail' },
  { slug: 'outlook' },
  { slug: 'tiktok' },
  { slug: 'paypal' },
  { slug: 'telegram' },
];

export const quickPlanSearchTerms: QuickPlanSearchTerm[] = quickPlanDefinitions.map(term => ({
  ...term,
  label: autoCategoryLabel(term.slug),
  query: `autocat: ${term.slug}`,
}));

export function quickPlanSearchPath(term: QuickPlanSearchTerm) {
  const params = new URLSearchParams();
  params.set('q', term.query);
  params.set('sort', 'price-asc');
  return `/shops?${params.toString()}`;
}

export function quickPlanSearchSeoPath(term: QuickPlanSearchTerm) {
  return `/shops/${term.slug}`;
}

export function quickPlanGatewayPath(term: QuickPlanSearchTerm) {
  if (!term.gatewayModelFamily) return '';
  const params = new URLSearchParams();
  params.set('model', term.gatewayModelFamily);
  return `/llm-gateway?${params.toString()}`;
}

export function quickPlanGatewayFamilyName(term: QuickPlanSearchTerm) {
  return term.gatewayModelFamilyName ?? term.gatewayModelFamily ?? term.label;
}

export function quickPlanSearchTermForSlug(slug: string | null | undefined) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  if (!normalizedSlug) return null;
  return quickPlanSearchTerms.find(term => term.slug === normalizedSlug || term.legacySlugs?.includes(normalizedSlug)) ?? null;
}

export function quickPlanSearchTermForOfficialPriceSlug(slug: string | null | undefined) {
  const normalizedSlug = (slug || '').trim().toLowerCase();
  if (!normalizedSlug) return null;
  return quickPlanSearchTerms.find(term => term.officialPriceSlug === normalizedSlug) ?? null;
}

export function quickPlanDisplayName(term: QuickPlanSearchTerm | null, name = term?.label ?? '') {
  return term?.legacyPlanName ? `${name} (${name.replace(/Pro \d+$/, term.legacyPlanName)})` : name;
}

export function quickPlanHeroName(term: QuickPlanSearchTerm | null, name = term?.label ?? '') {
  return term?.legacyPlanName ? `${name} (${term.legacyPlanName.replace('Pro ', '')})` : name;
}
