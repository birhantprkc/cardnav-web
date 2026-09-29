/**
 * 文件说明: 从赞助商资料和 placement 配置生成当前页面可展示的赞助商列表。
 */
import { getPool } from './store.js';
import { defaultLocale, type Locale } from './i18n/config.js';
import type { PageType } from './page-types.js';

export type SponsorTemplate = 'default' | 'grid';
export type SponsorImageScaleMode = 'contain' | 'cover' | 'inset';

type LocalizedValue<T> = Partial<Record<Locale, T>> & { default?: T };
type SponsorImageConfig = {
  src: string;
  scaleMode: SponsorImageScaleMode;
  padding?: string;
  backgroundColor?: string;
  alt: LocalizedValue<string>;
};
type SponsorLinkConfig = { color?: string; text: LocalizedValue<string>; url: LocalizedValue<string> };
export type SponsorConfig = {
  id: string;
  template: SponsorTemplate;
  image: SponsorImageConfig;
  title: LocalizedValue<string>;
  description: LocalizedValue<string>;
  url: LocalizedValue<string>;
  links?: SponsorLinkConfig[];
};

export type SponsorLink = { text: string; url: string; color?: string };
export type Sponsor = {
  id: string;
  template: SponsorTemplate;
  title: string;
  description: string;
  url: string;
  image: Omit<SponsorImageConfig, 'alt'> & { alt: string };
  links: SponsorLink[];
};

export type SponsorPlacement = 'page-bottom' | 'after-hero' | 'content-bottom';
export type SponsorQuery = { placement: SponsorPlacement; pageType: PageType; locale: Locale };

function localize<T>(values: LocalizedValue<T>, locale: Locale, fallback?: T): T {
  const value = values[locale] ?? values.default ?? values[defaultLocale] ?? fallback;
  if (value === undefined) throw new Error(`Missing localized sponsor value for ${locale}`);
  return value;
}

export function getSponsorListId({ placement, pageType }: Pick<SponsorQuery, 'placement' | 'pageType'>): 'gateways' | 'shop' | 'full' | null {
  switch (placement) {
    case 'page-bottom':
      if (!['guide', 'guide-detail'].includes(pageType)) return 'full';
      break;
    case 'content-bottom':
      if (['guide', 'guide-detail'].includes(pageType)) return 'full';
      break;
    case 'after-hero':
      if (pageType === 'gateway') return 'gateways';
      if (pageType === 'shops' || pageType === 'shop-keyword') return 'shop';
      break;
  }
  return null;
}

export function resolveSponsor(sponsor: SponsorConfig, locale: Locale): Sponsor {
  return {
    id: sponsor.id,
    template: sponsor.template,
    title: localize(sponsor.title, locale),
    description: localize(sponsor.description, locale, ''),
    url: localize(sponsor.url, locale),
    image: {
      src: sponsor.image.src,
      scaleMode: sponsor.image.scaleMode,
      padding: sponsor.image.padding,
      backgroundColor: sponsor.image.backgroundColor,
      alt: localize(sponsor.image.alt ?? {}, locale, ''),
    },
    links: (sponsor.links ?? []).map(link => ({
      text: localize(link.text, locale),
      url: localize(link.url, locale),
      color: link.color,
    })),
  };
}

export async function getSponsors({ placement, pageType, locale }: SponsorQuery): Promise<Sponsor[]> {
  const listId = getSponsorListId({ placement, pageType });
  if (!listId) return [];
  const result = await getPool().query(`
    SELECT id, title, description, url, template, links, image_options, image_url
    FROM public_sponsor_placements
    WHERE list_id = $1
    ORDER BY display_order
  `, [listId]);
  return result.rows.map(row => resolveSponsor({
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    template: row.template,
    links: row.links,
    image: { scaleMode: 'contain', ...row.image_options, src: row.image_url ?? '' },
  }, locale));
}
