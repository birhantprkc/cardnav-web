/**
 * 文件说明: 解析并匹配卡网商品页高级搜索查询，供商品筛选与快速搜索复用。
 */
import { parse, test, type LiqeQuery } from 'liqe';

export type ShopSearchRow = {
  productName: string;
  categoryName?: string;
  siteText?: string;
  siteUrl?: string;
};

export type ShopSearchFieldOptions = {
  matchCategory: boolean;
  matchMerchant: boolean;
  fuzzy?: boolean;
};

export type ShopSearchQuery =
  | { mode: 'empty' }
  | {
    mode: 'advanced';
    raw: string;
    ast: LiqeQuery;
    fieldFilters: { category: boolean; merchant: boolean };
  }
  | { mode: 'invalid'; raw: string };

function normalizeSearchText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeFuzzyText(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function fuzzyDistanceLimit(value: string) {
  if (value.length < 3) return 0;
  if (value.length <= 4) return 1;
  return 2;
}

function isWithinEditDistance(left: string, right: string, limit: number) {
  const leftChars = Array.from(left);
  const rightChars = Array.from(right);
  if (Math.abs(leftChars.length - rightChars.length) > limit) return false;

  let previous = Array.from({ length: rightChars.length + 1 }, (_value, index) => index);
  for (let leftIndex = 0; leftIndex < leftChars.length; leftIndex += 1) {
    const current = [leftIndex + 1];
    for (let rightIndex = 0; rightIndex < rightChars.length; rightIndex += 1) {
      const cost = leftChars[leftIndex] === rightChars[rightIndex] ? 0 : 1;
      const value = Math.min(
        current[rightIndex] + 1,
        previous[rightIndex + 1] + 1,
        previous[rightIndex] + cost,
      );
      current.push(value);
    }
    previous = current;
  }
  return previous[rightChars.length] <= limit;
}

function fuzzyFieldMatch(field: string, term: string) {
  if (field.includes(term)) return true;
  const distanceLimit = fuzzyDistanceLimit(term);
  if (!distanceLimit) return false;

  const fieldChars = Array.from(field);
  const termLength = Array.from(term).length;
  for (let start = 0; start < fieldChars.length; start += 1) {
    for (const length of [termLength - 1, termLength, termLength + 1]) {
      if (length < 1 || start + length > fieldChars.length) continue;
      if (isWithinEditDistance(term, fieldChars.slice(start, start + length).join(''), distanceLimit)) return true;
    }
  }
  return false;
}

function canUseSimpleFuzzySearch(query: Extract<ShopSearchQuery, { mode: 'advanced' }>) {
  return !/\b(?:NOT|OR)\b|[:()|"']/u.test(query.raw);
}

function quoteSearchToken(value: string) {
  return `"${value.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"')}"`;
}

function flushSearchToken(token: string) {
  if (!token) return '';
  if (/^(categoryName|siteText):[^\s()]+$/u.test(token)) return token;
  if (/^[\p{L}\p{N}_-]+$/u.test(token)) return token;
  return quoteSearchToken(token);
}

function normalizeAdvancedSearchOperators(value: string) {
  let result = '';
  let token = '';
  let quote: '"' | "'" | null = null;

  const flushTokenToResult = () => {
    result += flushSearchToken(token);
    token = '';
  };

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const previous = value[index - 1] || '';
    const next = value[index + 1] || '';

    if ((character === '"' || character === "'") && previous !== '\\') {
      quote = quote === character ? null : character;
      result += character;
      continue;
    }

    if (!quote && character === '|') {
      flushTokenToResult();
      result += ' OR ';
      continue;
    }

    if (!quote && character === '-' && (!previous || /\s|\(/u.test(previous)) && next) {
      flushTokenToResult();
      result += ' NOT ';
      while (/\s/u.test(value[index + 1] || '')) {
        index += 1;
      }
      continue;
    }

    if (!quote && /[\s()]/u.test(character)) {
      flushTokenToResult();
      result += character;
      continue;
    }

    if (quote) {
      result += character;
    } else {
      token += character;
    }
  }

  flushTokenToResult();
  return normalizeSearchText(result);
}

function normalizeSearchFieldAliases(value: string) {
  return value.replace(/(^|[\s(\-])(category|site)\s*:/giu, (_match, prefix: string, field: string) => {
    const normalizedField = field.toLowerCase() === 'category' ? 'categoryName' : 'siteText';
    return `${prefix}${normalizedField}:`;
  });
}

function searchFieldFilters(value: string) {
  return {
    category: /(^|[\s(\-])category\s*:/iu.test(value),
    merchant: /(^|[\s(\-])site\s*:/iu.test(value),
  };
}

export function prepareShopSearchQuery(value: string) {
  return normalizeAdvancedSearchOperators(normalizeSearchFieldAliases(value));
}

export function buildShopSearchQuery(value: string): ShopSearchQuery {
  const fieldFilters = searchFieldFilters(value);
  const raw = prepareShopSearchQuery(value);
  if (!raw) return { mode: 'empty' };
  try {
    return { mode: 'advanced', raw, ast: parse(raw), fieldFilters };
  } catch (_error) {
    return { mode: 'invalid', raw };
  }
}

export function buildShopSearchRow(row: ShopSearchRow, options: ShopSearchFieldOptions) {
  const searchable: Record<string, string> = {
    productName: row.productName,
  };
  if (options.matchCategory && row.categoryName) {
    searchable.categoryName = row.categoryName;
  }
  if (options.matchMerchant) {
    const siteText = [row.siteText, row.siteUrl].filter(Boolean).join(' ');
    if (siteText) searchable.siteText = siteText;
    if (row.siteUrl) searchable.siteUrl = row.siteUrl;
  }
  return searchable;
}

export function matchesShopSearchQuery(
  row: ShopSearchRow,
  query: ShopSearchQuery,
  options: ShopSearchFieldOptions,
) {
  if (query.mode === 'empty') return true;
  if (query.mode === 'invalid') return false;
  const searchable = buildShopSearchRow(row, {
    matchCategory: options.matchCategory || query.fieldFilters.category,
    matchMerchant: options.matchMerchant || query.fieldFilters.merchant,
  });
  if (options.fuzzy && canUseSimpleFuzzySearch(query)) {
    const fields = Object.values(searchable).map(normalizeFuzzyText);
    return query.raw.split(/\s+/u).every(term => {
      const normalizedTerm = normalizeFuzzyText(term);
      return normalizedTerm.length > 0 && fields.some(field => fuzzyFieldMatch(field, normalizedTerm));
    });
  }
  return test(query.ast, searchable);
}
