import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalOfficialPriceSlug, officialPlanIdentity, officialPriceStorageSlugs, quickPlanSearchTermForSlug, productForAutoCategory, quickPlanSearchTermForOfficialPriceSlug } from '../src/shop-plan-search.js';

test('official plans share category identities and link back to the same product', () => {
  for (const [app, plan, slug, name] of [
    ['chatgpt', 'plus', 'gpt-plus', 'GPT Plus'],
    ['gemini', 'ai-plus', 'gemini-plus', 'Gemini Plus'],
    ['gemini', 'advanced', 'gemini-pro', 'Gemini Pro'],
    ['gemini', 'ai-ultra', 'gemini-ultra-5x', 'Gemini Ultra 5x'],
    ['grok', 'supergrok-lite', 'supergrok-lite', 'SuperGrok Lite'],
    ['grok', 'supergrok-plus', 'supergrok-plus', 'SuperGrok Plus'],
  ]) {
    const identity = officialPlanIdentity(app, plan)!;
    const term = quickPlanSearchTermForOfficialPriceSlug(identity.urlSlug)!;
    assert.equal(identity.urlSlug, slug);
    assert.equal(identity.displayName, name);
    assert.equal(term.slug, slug);
    assert.equal(term.label, identity.displayName);
    assert.ok(productForAutoCategory(term.slug)?.icon);
  }
});

test('legacy official links resolve to canonical categories and still read old stored prices', () => {
  for (const [legacy, canonical] of [['gemini-ai-plus', 'gemini-plus'], ['gemini-advanced', 'gemini-pro'], ['grok-supergrok-lite', 'supergrok-lite'], ['chatgpt-pro-5x', 'gpt-pro-100']]) {
    assert.equal(canonicalOfficialPriceSlug(legacy), canonical);
    assert.equal(canonicalOfficialPriceSlug(canonical), canonical);
    assert.ok(officialPriceStorageSlugs(canonical).includes(legacy));
  }
  assert.equal(canonicalOfficialPriceSlug('copilot-pro'), 'copilot-pro');
});

test('official Cursor tiers link to the existing Cursor account category', () => {
  for (const plan of ['pro', 'pro-plus', 'ultra']) {
    const identity = officialPlanIdentity('cursor', plan)!;
    assert.equal(quickPlanSearchTermForOfficialPriceSlug(identity.urlSlug)?.slug, 'cursor');
  }
  assert.equal(officialPlanIdentity('microsoft-365', 'personal')?.displayName, 'Microsoft 365 Personal');
  assert.equal(quickPlanSearchTermForOfficialPriceSlug('microsoft-365-personal'), null);
});


test('all-product pages default to a standard official plan without replacing specific tier links', () => {
  for (const [product, slug] of [['gpt','gpt-plus'], ['claude','claude-pro'], ['gemini','gemini-pro'], ['grok','supergrok'], ['cursor','cursor-pro'], ['x','x-premium'], ['copilot','microsoft-365-personal']]) {
    assert.equal(quickPlanSearchTermForSlug(product)?.officialPriceSlug, slug);
  }
  assert.equal(quickPlanSearchTermForOfficialPriceSlug('gpt-plus')?.slug, 'gpt-plus');
  assert.equal(quickPlanSearchTermForSlug('gpt-pro-500')?.officialPriceSlug, 'gpt-pro-500');
  assert.equal(quickPlanSearchTermForSlug('muse')?.officialPriceSlug, undefined);
});
