/** Public search vocabulary. Boundaries keep short aliases out of unrelated words and URLs. */
const brandAliases: readonly [RegExp, string][] = [
  [/鸡屁踢|鸡皮踢|挤鼻涕|g皮t|gρt|[🐔🐓🐤🐥🐦🐣🐕]\s*pt/gu, 'gpt'],
  [/格洛克|格罗克/gu, 'grok'],
  [/克劳德/gu, 'claude'],
  [/(?<![a-z0-9])(?:chat[\s._-]*gpt|open[\s/._-]*ai|codex|gtp|gpt|g)(?![a-z0-9])/gu, 'gpt'],
  [/(?<![a-z0-9])(?:super[\s._-]*)?gr[o0][\s._-]*k(?![a-z])/gu, 'grok'],
  [/(?<![a-z0-9])(?:super[\s._-]*)?(?:gro|gork)(?![a-z])/gu, 'grok'],
  [/(?<![a-z0-9])c[l1]aude(?![a-z])/gu, 'claude'],
  [/(?<![a-z0-9])google\s*ai(?![a-z])/gu, 'gemini'],
];

export function normalizeShopSearchAliases(value: string): string {
  let text = value.normalize('NFKC').toLowerCase().replace(/\p{Cf}/gu, '');
  for (const [pattern, replacement] of brandAliases) text = text.replace(pattern, replacement);
  return text;
}
