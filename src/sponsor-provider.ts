/**
 * 文件说明: 从赞助商资料和 placement 配置生成当前页面可展示的赞助商列表。
 * 对应文档: docs/specs/public-page-types.md
 */
import sponsorsData from './data/sponsors.json' with { type: 'json' };
import sponsorListData from './data/sponsor-list.json' with { type: 'json' };
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
type SponsorConfig = {
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

const sponsorConfigs = sponsorsData as SponsorConfig[];
const sponsorLists = sponsorListData['sponsor-list'] as { gateways: string[]; full: string[] };

function localize<T>(values: LocalizedValue<T>, locale: Locale): T {
  const value = values[locale] ?? values.default ?? values[defaultLocale];
  if (value === undefined) throw new Error(`Missing localized sponsor value for ${locale}`);
  return value;
}

function getSponsorIds({ placement, pageType }: Pick<SponsorQuery, 'placement' | 'pageType'>): string[] {
  switch (placement) {
    case 'page-bottom':
      if (!['guide', 'guide-detail'].includes(pageType)) return sponsorLists.full;
      break;
    case 'content-bottom':
      if (['guide', 'guide-detail'].includes(pageType)) return sponsorLists.full;
      break;
    case 'after-hero':
      if (pageType === 'gateway') return sponsorLists.gateways;
      break;
  }
  return [];
}

export function getSponsors({ placement, pageType, locale }: SponsorQuery): Sponsor[] {
  const sponsorIds = getSponsorIds({ placement, pageType });
  return sponsorIds
    .map(id => sponsorConfigs.find(sponsor => sponsor.id === id))
    .filter((sponsor): sponsor is SponsorConfig => Boolean(sponsor))
    .map(sponsor => ({
      id: sponsor.id,
      template: sponsor.template,
      title: localize(sponsor.title, locale),
      description: localize(sponsor.description, locale),
      url: localize(sponsor.url, locale),
      image: {
        src: sponsor.image.src,
        scaleMode: sponsor.image.scaleMode,
        padding: sponsor.image.padding,
        backgroundColor: sponsor.image.backgroundColor,
        alt: localize(sponsor.image.alt, locale),
      },
      links: (sponsor.links ?? []).map(link => ({
        text: localize(link.text, locale),
        url: localize(link.url, locale),
        color: link.color,
      })),
    }));
}
